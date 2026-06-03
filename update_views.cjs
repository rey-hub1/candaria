const fs = require('fs');

function updateView(name, propName) {
    const path = `resources/js/Pages/${name}/Index.jsx`;
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');

    // 1. Ensure FilterBar and SortableHeader are imported
    if (!content.includes('import FilterBar')) {
        content = content.replace(
            `import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';`,
            `import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';\nimport FilterBar from '@/Components/FilterBar';\nimport SortableHeader from '@/Components/SortableHeader';`
        );
    }

    // 2. Add filters to props
    if (content.includes(`export default function Index({ ${propName} = [],`)) {
        content = content.replace(
            `export default function Index({ ${propName} = [],`,
            `export default function Index({ ${propName} = { data: [], links: [], total: 0 }, filters = {},`
        );
    } else if (content.includes(`export default function Index({ ${propName} = [] })`)) {
        content = content.replace(
            `export default function Index({ ${propName} = [] })`,
            `export default function Index({ ${propName} = { data: [], links: [], total: 0 }, filters = {} })`
        );
    }

    // 3. Fix map and length checks
    content = content.replace(new RegExp(`\\b${propName}\\.length`, 'g'), `${propName}.data.length`);
    content = content.replace(new RegExp(`\\b${propName}\\.map`, 'g'), `${propName}.data.map`);

    // 4. Inject FilterBar
    if (!content.includes('<FilterBar')) {
        content = content.replace(
            `<div className="space-y-4">`,
            `<div className="space-y-4">\n                <FilterBar filters={filters} searchPlaceholder="Cari data..." />`
        );
        content = content.replace(
            `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`,
            `<div className="mb-4"><FilterBar filters={filters} searchPlaceholder="Cari data..." /></div>\n            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
        );
    }

    // 5. Add Pagination component definition if it doesn't exist
    if (!content.includes('const Pagination')) {
        const paginationCode = `\n    const Pagination = ({ links = [] }) => {\n        if (links.length <= 3) return null;\n        return (\n            <div className="flex flex-wrap gap-1 justify-center mt-4">\n                {links.map((link, key) => (\n                    link.url === null ? (\n                        <div key={key} className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50" dangerouslySetInnerHTML={{ __html: link.label }} />\n                    ) : (\n                        <Link key={key} href={link.url} className={\`px-3 py-1.5 text-xs border rounded-lg transition \${link.active ? 'bg-emerald-600 border-emerald-600 text-white font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}\`} dangerouslySetInnerHTML={{ __html: link.label }} />\n                    )\n                ))}\n            </div>\n        );\n    };\n`;
        content = content.replace(`export default function Index(`, `${paginationCode}\nexport default function Index(`);
    }

    // 6. Inject Pagination rendering
    if (!content.includes('<Pagination')) {
        // Find the end of the table or card stack and insert
        // Just put it before the last `</>` or `</div>` of the list block
        content = content.replace(/<\/table>\s*<\/div>\s*<\/div>/, `</table>\n                            </div>\n                            <Pagination links={${propName}.links} />`);
    }

    fs.writeFileSync(path, content);
}

updateView('Products', 'products');
updateView('Categories', 'categories');
updateView('Sellers', 'sellers');
updateView('MarginRules', 'rules');
console.log("Views updated!");
