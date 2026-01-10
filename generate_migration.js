const fs = require('fs');
const data = require('./menu_data.json');

const allergenMap = {
    'Glutine': 'glutine',
    'Crostacei': 'crostacei',
    'Uova': 'uova',
    'Pesce': 'pesce',
    'Arachidi': 'arachidi',
    'Soia': 'soia',
    'Latte': 'lattosio', // Mapping "Latte" or "Lattosio" usually to 'lattosio' id based on observation
    'Lattosio': 'lattosio',
    'Frutta secca': 'frutta-secca',
    'Sedano': 'sedano',
    'Senape': 'senape',
    'Sesamo': 'sesamo',
    'Solfiti': 'solfiti',
    'Lupini': 'lupini',
    'Molluschi': 'molluschi'
};

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

let sql = `
-- Migration Script for Magna Roma Menu
-- Generated automatically
-- REPLACE 'REPLACE_WITH_TENANT_ID' with the actual Tenant UUID

DO $$
DECLARE
    v_tenant_id uuid := 'REPLACE_WITH_TENANT_ID';
    v_cat_id uuid;
BEGIN
    -- Ensure tenant exists or error out if invalid UUID (handled by Postgres runtime)
    -- Start Transaction
`;

data.forEach((category, catIndex) => {
    const catSlug = slugify(category.name);
    // Using a simpler approach: Insert category, get ID, then insert dishes.
    // We re-declare v_cat_id reuse it.

    sql += `
    -- Category: ${category.name}
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, '${catSlug}', '${category.name.replace(/'/g, "''")}', ${catIndex * 10}, true)
    RETURNING id INTO v_cat_id;
  `;

    if (category.dishes && category.dishes.length > 0) {
        sql += `
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES`;

        const values = category.dishes.map((dish, dishIndex) => {
            const dishSlug = slugify(dish.name);
            const allergenIds = (dish.tags || [])
                .map(t => allergenMap[t])
                .filter(id => id) // Remove nulls/undefined
                .map(id => `'${id}'`);

            const allergenArray = allergenIds.length > 0 ? `ARRAY[${allergenIds.join(',')}]` : 'ARRAY[]::text[]';

            // Infer basic flags from tags?
            // Does not seem to have specific tags for Veg/Vegan in scraped data labels, assuming defaults.
            // But if there are tags like "Vegetariano" we could use them.
            // The scraped "tags" mostly verify allergens.

            return `
    (v_tenant_id, v_cat_id, '${dishSlug}', '${dish.name.replace(/'/g, "''")}', '${dish.description.replace(/'/g, "''")}', ${dish.price}, ${allergenArray}, ${dishIndex * 10}, true, false, false, false, false, false, false)`;
        });

        sql += values.join(',') + ';';
    }

    sql += '\n';
});

sql += `
END $$;
`;

fs.writeFileSync('menu_migration.sql', sql);
console.log('SQL generated in menu_migration.sql');
