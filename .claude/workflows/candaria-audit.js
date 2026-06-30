export const meta = {
  name: 'candaria-audit',
  description: 'Audit Candaria: security holes, broken flows, missing/useless features across all domains',
  phases: [
    { title: 'Review' },
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          category: { type: 'string', enum: ['security', 'broken_flow', 'missing_important', 'useless', 'missing_nice', 'flow_mistake'] },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          file: { type: 'string', description: 'file:line or file path' },
          detail: { type: 'string', description: 'what is wrong and why, concrete' },
          fix: { type: 'string', description: 'suggested fix, short' },
        },
        required: ['title', 'category', 'severity', 'file', 'detail', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    isReal: { type: 'boolean', description: 'true if the finding is genuinely a real issue after checking the actual code' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    note: { type: 'string', description: 'why confirmed or refuted, citing actual code' },
  },
  required: ['isReal', 'confidence', 'note'],
}

const base = `You are auditing the Candaria codebase (Laravel 13 + React/Inertia, SQLite) at the repo root. School canteen POS + consignment + student marketplace.
Read the relevant controllers/services/models/routes/middleware. Look for: (1) SECURITY holes — authz bypass, IDOR, mass-assignment, missing ownership checks, race conditions on money/stock, SQL/injection, leaking data across tenants/roles; (2) BROKEN or CONFUSING flows — steps that dead-end, double-charge, lose money/stock, inconsistent state; (3) MISSING IMPORTANT features the domain clearly needs; (4) USELESS features that add complexity with no value; (5) MISSING NICE-to-have features that would meaningfully help; (6) FLOW MISTAKES — wrong order of operations, validation gaps.
Be concrete: cite file:line. Only report real findings backed by reading actual code — no generic advice. Prefer fewer high-signal findings over many weak ones.`

const DOMAINS = [
  { key: 'auth', prompt: `${base}\n\nFOCUS: Authentication & access control. Read app/Http/Middleware/{RoleMiddleware,EnsureFeatureEnabled,EnsurePasswordChanged,EnsureStudentPasswordChanged,IdleTimeout,HandleInertiaRequests}.php, app/Http/Controllers/Auth/*, app/Http/Controllers/Student/PasswordController.php, routes/auth.php, routes/web.php, app/Models/{User,Student,FeatureFlag}.php. Check: role enforcement on every route group, student vs staff auth separation, forced-password-change bypass, feature-flag gating, session/idle handling, password reset abuse.` },
  { key: 'pos', prompt: `${base}\n\nFOCUS: POS transactions & cashbook. Read app/Services/TransactionService.php, app/Http/Controllers/{Transaction,Cashbook,ChangeDebt}Controller.php, app/Models/{Transaction,TransactionItem,Cashbook,ChangeDebt}.php. Check: checkout math, void/soft-void consistency (active() scope), cashbook contra entries, change-debt (hutang kembalian) lifecycle, stock decrement, concurrency/double-submit, audit logging.` },
  { key: 'consignment', prompt: `${base}\n\nFOCUS: Consignment. Read app/Http/Controllers/{Consignment,Seller,Settlement,MarginRule,Product,Category}Controller.php, app/Models/{Consignment,Seller,SellerSettlement,MarginRule,Product}.php. Check: margin/settlement math, seller payout correctness, stok titipan harian, product code generation, image upload handling, settlement double-pay.` },
  { key: 'orders', prompt: `${base}\n\nFOCUS: Marketplace student orders & vendor order mgmt. Read app/Services/OrderService.php, app/Http/Controllers/Student/{Marketplace,Order}Controller.php, app/Http/Controllers/Vendor/OrderController.php, app/Models/{Order,OrderItem,OrderItemOption,OrderStatusHistory,MenuItem,MenuOption,MenuOptionGroup}.php. Check: cart/checkout pricing with options, slot quota enforcement, order status transitions, ownership (student can only see own orders, vendor only own orders), stock/availability, race on quota.` },
  { key: 'wallet', prompt: `${base}\n\nFOCUS: Marketplace wallet, ledger & settlements. Read app/Services/VendorWalletService.php, app/Http/Controllers/Vendor/WalletController.php, app/Http/Controllers/Admin/VendorSettlementController.php, app/Models/{VendorLedger,VendorSettlement,Vendor}.php. Check: ledger balance integrity, credit on order completion, settlement amount math, double-settlement, negative balance, money created/destroyed, idempotency.` },
  { key: 'superadmin', prompt: `${base}\n\nFOCUS: Super-admin destructive tools. Read app/Http/Controllers/SuperAdmin/{DemoData,TransactionPurge,FeatureFlag,TestRunner}Controller.php, app/Services/DemoDataService.php. Check: purge/reset guardrails, role gating, TestRunner running arbitrary commands (RCE risk), demo-data wiping real data, confirmation requirements, what cascades on delete.` },
  { key: 'reports', prompt: `${base}\n\nFOCUS: Reports & exports. Read app/Services/{ReportService,WeeklyReportService}.php, app/Http/Controllers/{Report,WeeklyReport,DailyUpload}Controller.php, app/Http/Controllers/Admin/MarketplaceReportController.php. Check: date keying (transaction_date vs created_at), void exclusion in totals, export auth, money aggregation correctness, off-by-one date ranges, missing report dimensions.` },
]

phase('Review')
const reviewed = await pipeline(
  DOMAINS,
  d => agent(d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA, model: 'sonnet' }),
  (review, domain) => {
    const findings = (review?.findings || []).map(f => ({ ...f, domain: domain.key }))
    // verify only critical/high; auto-pass medium/low through
    const toVerify = findings.filter(f => f.severity === 'critical' || f.severity === 'high')
    const autopass = findings.filter(f => f.severity === 'medium' || f.severity === 'low')
      .map(f => ({ ...f, verdict: { isReal: true, confidence: 'medium', note: 'not adversarially verified (medium/low)' } }))
    return parallel(toVerify.map(f => () =>
      agent(`Adversarially verify this audit finding by reading the actual code. Try to REFUTE it. Default to isReal=false if the code does not clearly support the claim.\n\nDOMAIN: ${f.domain}\nTITLE: ${f.title}\nCATEGORY: ${f.category}\nSEVERITY: ${f.severity}\nFILE: ${f.file}\nCLAIM: ${f.detail}`,
        { label: `verify:${f.domain}:${f.title.slice(0,30)}`, phase: 'Verify', schema: VERDICT_SCHEMA, model: 'sonnet' })
        .then(v => ({ ...f, verdict: v }))
    )).then(verified => [...verified.filter(Boolean), ...autopass])
  }
)

const all = reviewed.flat().filter(Boolean)
const confirmed = all.filter(f => f.verdict?.isReal)
log(`${all.length} findings, ${confirmed.length} confirmed`)

phase('Synthesize')
const summary = await agent(
  `You are the lead auditor. Below are CONFIRMED findings from a multi-domain audit of the Candaria canteen/marketplace app. Produce a prioritized executive report in INDONESIAN.
Group by severity (Critical → High → Medium → Low). For each: short title, where (file), what's wrong, suggested fix. Then a short section "Fitur yang kurang" (missing features) and "Fitur tak berguna / over-engineered". End with a top-5 action list. Be concrete and terse. Do NOT invent findings beyond the data.\n\nDATA (JSON):\n${JSON.stringify(confirmed, null, 1)}`,
  { label: 'synthesize', phase: 'Synthesize', model: 'sonnet' }
)

return { totalFindings: all.length, confirmed: confirmed.length, byDomain: DOMAINS.map(d => ({ domain: d.key, count: confirmed.filter(f => f.domain === d.key).length })), report: summary, findings: confirmed }
