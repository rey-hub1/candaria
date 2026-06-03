const fs = require('fs');
const models = ['Category', 'Product', 'Seller', 'Transaction', 'User', 'MarginRule', 'Consignment', 'SellerSettlement'];

models.forEach(model => {
    const path = `app/Models/${model}.php`;
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace 'use Filterable;' with 'use \App\Traits\Filterable;'
    content = content.replace(/use Filterable;/g, "use \\App\\Traits\\Filterable;");
    
    fs.writeFileSync(path, content);
});

console.log("Models fixed!");
