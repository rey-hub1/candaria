const fs = require('fs');

function updateController(name, searchCols) {
    const path = `app/Http/Controllers/${name}Controller.php`;
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    // For index method
    if (name === 'Product') {
        content = content.replace(
            `$products = Product::with(['category', 'seller'])->get();`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $products = Product::with(['category', 'seller'])->filter($filters, ${searchCols})->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `compact('products', 'categories', 'sellers')`,
            `['products' => $products, 'categories' => $categories, 'sellers' => $sellers, 'filters' => $filters]`
        );
    } else if (name === 'Category') {
        content = content.replace(
            `$categories = Category::withCount('products')->get();`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $categories = Category::withCount('products')->filter($filters, ${searchCols})->paginate(15)->withQueryString();`
        );
        // Fallback if previous replacement didn't match
        content = content.replace(
            `$categories = Category::all();`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $categories = Category::filter($filters, ${searchCols})->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `compact('categories')`,
            `['categories' => $categories, 'filters' => $filters]`
        );
    } else if (name === 'Seller') {
        content = content.replace(
            `$sellers = Seller::withCount('products')->get();`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $sellers = Seller::withCount('products')->filter($filters, ${searchCols})->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `$sellers = Seller::all();`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $sellers = Seller::filter($filters, ${searchCols})->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `compact('sellers')`,
            `['sellers' => $sellers, 'filters' => $filters]`
        );
    } else if (name === 'User') {
        content = content.replace(
            `$users = User::paginate(10);`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $users = User::filter($filters, ${searchCols})->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `compact('users')`,
            `['users' => $users, 'filters' => $filters]`
        );
    } else if (name === 'Transaction') {
        content = content.replace(
            `$transactions = Transaction::with(['user', 'items.product'])
            ->latest()
            ->paginate(15);`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $transactions = Transaction::with(['user', 'items.product'])->filter($filters, ${searchCols})->latest()->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `compact('transactions')`,
            `['transactions' => $transactions, 'filters' => $filters]`
        );
    } else if (name === 'MarginRule') {
        content = content.replace(
            `$rules = MarginRule::orderBy('min_price', 'asc')->get();`,
            `$filters = request()->only(['search', 'sort', 'dir']);\n        $rules = MarginRule::filter($filters, ${searchCols})->orderBy('min_price', 'asc')->paginate(15)->withQueryString();`
        );
        content = content.replace(
            `compact('rules')`,
            `['rules' => $rules, 'filters' => $filters]`
        );
    }

    fs.writeFileSync(path, content);
}

updateController('Product', "['name', 'code', 'type']");
updateController('Category', "['name', 'slug']");
updateController('Seller', "['name', 'phone', 'class']");
updateController('User', "['name', 'email', 'role']");
updateController('Transaction', "['transaction_code']");
updateController('MarginRule', "['margin', 'min_price']");
console.log("Controllers updated!");
