const fs = require('fs');

const models = ['Category', 'Product', 'Seller', 'Transaction', 'User', 'MarginRule', 'Consignment', 'SellerSettlement'];
models.forEach(model => {
    const path = `app/Models/${model}.php`;
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('use App\\Traits\\Filterable;')) {
        content = content.replace(/use Illuminate\\Database\\Eloquent\\Model;/, "use Illuminate\\Database\\Eloquent\\Model;\nuse App\\Traits\\Filterable;");
        content = content.replace(`class ${model} extends Model\n{`, `class ${model} extends Model\n{\n    use Filterable;\n`);
        // handle cases where class signature is slightly different (like User extends Authenticatable)
        content = content.replace(`class ${model} extends Authenticatable\n{`, `class ${model} extends Authenticatable\n{\n    use Filterable;\n`);
        fs.writeFileSync(path, content);
    }
});

console.log("Models updated!");
