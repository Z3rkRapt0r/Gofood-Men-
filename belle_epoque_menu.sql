
-- Migration Script for Belle Epoque Palermo Menu
-- Generated automatically

DO $$
DECLARE
    v_tenant_id uuid := '82cf542c-4389-46b4-a4ed-1a9f13800b76'; -- Current tenant ID
    v_cat_id uuid;
BEGIN

    -- Category: Antipasti
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'antipasti', 'Antipasti', 0, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'patatine-fritte', 'Patatine fritte*', '', 5, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/patatine-1024x583.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'patate-al-forno', 'Patate al forno', '', 5, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/pata-forno-1024x509.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'misto-caldo', 'Misto caldo', 'Patatine fritte*, patate al forno, crocchette di patate aromatizzate con mentuccia e prezzemolo (di nostra produzione).', 7, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/misto-1-1024x453.jpg', 20, true),
    (v_tenant_id, v_cat_id, 'cuccagna', 'Cuccagna', 'Patatine fritte*, patate al forno, crocchette di patate aromatizzate con mentuccia e prezzemolo (di nostra produzione) e wurstel di maiale servelade di puro suino.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/cuccagnaa-1024x693.jpg', 30, true),
    (v_tenant_id, v_cat_id, 'bruschetta-parmina', 'Bruschetta parmina', 'Crudo di parma, mozzarella fior di latte, pomodorini, rucola, scaglie di grana padano, 2pz.', 4, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/parmina-1024x995.jpg', 40, true),
    (v_tenant_id, v_cat_id, 'bruschetta-speck', 'Bruschetta speck', 'Speck, patè di pomodorini soleggiati, pomodorini, 2pz.', 4, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/speck-1024x908.jpg', 50, true),
    (v_tenant_id, v_cat_id, 'bruschetta-mortazza', 'Bruschetta Mortazza', 'Mortadella, burrata, pesto di pistacchio, pomodorini, 2pz.', 4, '', 60, true),
    (v_tenant_id, v_cat_id, 'bruschetta-salmone', 'Bruschetta Salmone', 'Salmone Norvegese affumicato, philadelphia, pomodorini, 2pz.', 4, '', 70, true),
    (v_tenant_id, v_cat_id, 'bruschetta-lardo', 'Bruschetta lardo', 'Lardo di suino nero, dolce di gorgonzola, pomodorini, 2pz.', 4, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/lardo-1-1024x539.jpg', 80, true),
    (v_tenant_id, v_cat_id, 'burratina', 'Burratina', 'Crudo di Parma, burrata fresca, scaglie di grana Padano, pomodorino, rucola, miele di ape nera sicula, crostini di pane.', 15, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/burratina-1024x830.jpg', 90, true),
    (v_tenant_id, v_cat_id, 'tagliere-salumi-e-formaggi', 'Tagliere salumi e formaggi', '', 20, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/tagliere-1024x767.jpg', 100, true);

    -- Category: PIATTI SINGOLI
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'piatti-singoli', 'PIATTI SINGOLI', 10, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'scottona-doc', 'Scottona DOC', 'Scottona (350 gr), dolce gorgonzola, patate al forno aromatizzate, scaglie di grana Padano, pomodoro e rucola', 18, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/scottona-1024x714.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'stinchetto-doc', 'Stinchetto DOC', 'Stinco di maiale* (di nostra produzione), scamorza affumicata, cipolla caramellata, patate al forno.', 18, 'https://www.belleepoquepalermo.it/wp-content/uploads/2024/11/Immagine-WhatsApp-2024-11-23-ore-15.42.25_3fcb64ed-1024x768.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'occhio-di-bue', 'Occhio di bue', 'Hamburger (300 gr), prosciutto cotto, uovo all’occhio di bue, provola dolce, pomodoro, cristallina, salsa affumicata e salsa agrodolce.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/05/occhio-bue-1024x997.jpeg', 20, true),
    (v_tenant_id, v_cat_id, 'il-pistacchione', 'Il Pistacchione', 'Hamburger (300 gr), mortadella, burrata, patate al forno, pesto di pistacchio e miele.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/pistacchione-1024x1024.jpg', 30, true),
    (v_tenant_id, v_cat_id, 'costata-doc', 'Costata DOC', 'Costata di maiale (300 gr), mozzarella fior di latte, cipolla caramellata, patate al forno, melenzane e zucchine.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/costata-doc-1024x1024.jpg', 40, true),
    (v_tenant_id, v_cat_id, 'plutone-doc', 'Plutone DOC', 'Involtino alla palermitana, carpaccio di bresaola, mozzarella fior di latte, funghi, patate al forno, insalata mista e crostini di pane.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2024/07/plutonr-1024x795.jpg', 50, true),
    (v_tenant_id, v_cat_id, 'bufalina', 'Bufalina', 'Involtino ai pistacchi, prosciutto crudo di Parma, mozzarella fior di latte, funghi, pomodoro, rucola.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/bufalina-1024x767.jpg', 60, true),
    (v_tenant_id, v_cat_id, 'il-porchettone', 'Il Porchettone', 'Doppia porchetta (di nostra produzione), wurstel servelade, cipolla caramellata, emmenthal, patate al forno.', 15, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/porchettone-1024x1011.jpg', 70, true),
    (v_tenant_id, v_cat_id, 'roast-beef-doc', 'Roast Beef DOC', 'Roastbeef (di nostra produzione), mozzarella fior di latte, funghi, melenzane, zucchine, radicchio grigliato, pomodoro e scaglie di grana Padano e crostini di pane.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/rosbif-1024x767.jpg', 80, true),
    (v_tenant_id, v_cat_id, 'ribs-doc', 'Ribs DOC', 'Costina di maiale (di nostra produzione), pancetta coppata, scamorza affumicata, patate al forno.', 16, '', 90, true),
    (v_tenant_id, v_cat_id, 'apollo', 'Apollo', 'Filetto di pollo panato, speck, mozzarella fior di latte, zucchine, melenzane, funghi e patate al forno.', 16, 'https://www.belleepoquepalermo.it/wp-content/uploads/2025/06/apollo-1024x694.jpg', 100, true),
    (v_tenant_id, v_cat_id, 'poseidone-doc', 'Poseidone DOC', 'Salmone Norvegese, tonno, alici marinate, burrata, patate al forno, insalata mista e crostini di pane.', 18, '', 110, true),
    (v_tenant_id, v_cat_id, 'spada', 'Spada', 'Pesce spada*, mozzarella fior di latte, verdure grigliate e patate al forno.', 17, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/spada-1024x626.jpg', 120, true);

    -- Category: Secondi piatti
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'secondi-piatti', 'Secondi piatti', 20, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'primis', 'Primis', 'Scottona (600 gr), patate al forno, carote, pomodoro, grana, olive, verdure grigliate emozzarella fior di latte , misticanza di verdure fresche.', 29, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/primis-1024x875.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'secundo', 'Secundo', 'Hamburger (500 gr) e Wurstel di maiale, uovo ad occhio di bue, patate al forno, carote, pomodoro olive, mozzarella fior di latte, grana, verdure grigliate, misticanza di verdure fresche.', 25, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/afrodite-1024x767.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'tertius', 'Tertius', 'Crudo di Parma, involtino di pollo, pollo panato, patate al forno, verdure grigliate, misticanza di verdure fresche, carote, pomodoro, olive, grana, mozzarella fior di latte .', 25, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/tertius-2-1024x611.jpg', 20, true),
    (v_tenant_id, v_cat_id, 'camilla', 'Camilla', 'Stinco di maiale fresco di nostra produzione, con patate al forno, mais, carote, olive, pomodoro grana, mozzarella fior di latte, verdure grigliate, misticanza di verdure fresche.', 25, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/camilla-2-1024x768.jpg', 30, true),
    (v_tenant_id, v_cat_id, 'caterina', 'Caterina', 'Costata di maiale panata (500gr) e involtino di vitello, verdure grigliate, misticanza di verdure fresche, carote, olive, grana, mozzarella fior di latte, pomodoro.', 23, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/caterina-1024x767.jpg', 40, true),
    (v_tenant_id, v_cat_id, 'tagliata-epoque', 'Tagliata Epoque', 'Tagliata di Scottona da 630 gr, burrata fresca, patate al forno, pomodoro e rucola.', 29, 'https://www.belleepoquepalermo.it/wp-content/uploads/2024/11/Immagine-WhatsApp-2024-11-30-ore-16.06.41_1072bb89-768x576.jpg', 50, true),
    (v_tenant_id, v_cat_id, 'afrodite', 'Afrodite', 'Hamburger di bovino (250 gr.), salsiccia di maiale, patate a forno, misticanza di verdure fresche, carote, verdure grigliate, olive, pomodoro, grana Padano, mozzarella fior di latte.', 23, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/afrodite-1024x767.jpg', 60, true),
    (v_tenant_id, v_cat_id, 'tanina', 'Tanina', 'Scottona panata (600 gr), mozzarella fior di latte, patate al forno, verdure grigliate.', 29, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/tanina-1024x767.jpg', 70, true),
    (v_tenant_id, v_cat_id, 'roma', 'Roma', 'Piatto di roastbeef di nostra produzione, porchetta di nostra produzione, patate al forno, verdure grigliate, misticanza di verdure fresche, olive, pomodoro, carote, mozzarella fior di latte.', 23, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/roma.jpg', 80, true),
    (v_tenant_id, v_cat_id, 'capriccio', 'Capriccio', 'Bresaola, crudo di Parma, verdure grigliate, patate al forno, pomodoro, misticanza di verdure fresche, carote, olive, mozzarella fior di latte, scaglie di grana.', 20, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/capriccio-2.jpg', 90, true),
    (v_tenant_id, v_cat_id, 'olivia', 'Olivia', 'Costata di maiale panata (500gr), hamburger (250 gr), verdure grigliate, patate al forno, misticanza di verdure fresche, pomodoro, carote, olive, mozzarella fior di latte , grana.', 23, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/caterina-1024x767.jpg', 100, true),
    (v_tenant_id, v_cat_id, 'paloma', 'Paloma', 'Involtini di vitello e involtino di pollo, crudo di Parma, verdure grigliate, patate al forno, misticanza di verdure fresche, pomodoro, carote, olive.', 25, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/paloma.jpg', 110, true),
    (v_tenant_id, v_cat_id, 'vegetariana', 'Vegetariana', 'Misticanza di verdure fresche, pomodoro, carote, olive, verdure grigliate, scagli di grana, mozzarella fior di latte .', 13, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/vegetariana-2.jpg', 120, true),
    (v_tenant_id, v_cat_id, 'costanza', 'Costanza', 'Pesce spada* grigliato, tonno sott’olio, salmone affumicato, gamberone* atlantico surgelato a bordo, patate al forno, misticanza di verdure fresche e verdure grigliate, pomodoro, carote, olive.', 25, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/05/cstanza-2-1-1024x645.jpeg', 130, true);

    -- Category: Le insalate della tradizione
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'le-insalate-della-tradizione', 'Le insalate della tradizione', 30, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'mediterranea', 'Mediterranea', 'Scottona (350 gr), costata di maiale (350 gr), involtini alla palermitana, hamburger (250gr), salsiccia, salame dolce, speck, mozzarella fior di latte e patate al forno. 2/3 persone', 55, 'https://www.belleepoquepalermo.it/wp-content/uploads/2024/04/medi-1024x768.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'dietetica', 'Dietetica', '4/5 persone', 65, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/dietetica-1024x677.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'meravigliaio', 'Meravigliaio', 'Super tagliere di 7 kg di carne mista. 5 persone', 80, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/meraviglia-1024x655.jpg', 20, true);

    -- Category: PANINI GOURMET
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'panini-gourmet', 'PANINI GOURMET', 40, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'burrata-burger', 'Burrata Burger', 'Hamburger di bovino (250 gr.), crudo di Parma, burrata fresca, scaglie di grana Padana, funghi freschi, lattuga, con contorno di patate al forno.', 12, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/burrataa-256x256.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'pink-burger', 'Pink burger', 'Hamburger di bovino (250 gr.), mortadella IGP, burrata fresca, scaglie di grana Padano, pomodoro, lattuga, pesto di pistacchi con contorno di patate al forno.', 12, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/05/pink-1024x927.jpeg', 10, true),
    (v_tenant_id, v_cat_id, 'black-rock', 'Black Rock', 'Hamburger di bovino (250 gr.), lardo di suino nero, dolce gorgonzola, nduja, melenzane, pomodoro, lattuga, pane a carbone vegetale con contorno di patate al forno.', 12, '', 20, true),
    (v_tenant_id, v_cat_id, 'leggend-burger', 'Leggend Burger', 'Hamburger di bovino (250 gr.), pancetta coppata, provola dolce, patata macario, pomodoro, salsa affumicata con contorno di patate al forno.', 12, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/leggend-3-1-902x1024.jpg', 30, true);

    -- Category: PANINI DELICIOUS
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'panini-delicious', 'PANINI DELICIOUS', 50, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'mama-burger', 'Mama burger', 'Hamburger di bovino (250 gr.), vastedda del Belice, pomodorini soleggiati, miele di ape nera sicula, lattuga e salsa affumicata.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/mama-985x1024.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'pork-burger', 'Pork Burger', 'Hamburger di bovino (250 gr.), provola delle Madonie, pomodoro, rucola selvatica, miele di astragalo Nebroolensis, mortadella, salsa agrodolce.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/porko--766x731.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'mambo-burger', 'Mambo Burger', 'Hamburger di bovino (250 gr.), porchetta di nostra produzione,cheddar, lattuga, pomodoro, salsa affumicata.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/mambo-3-672x372.jpg', 20, true),
    (v_tenant_id, v_cat_id, 'cis-burger', 'Cis Burger', 'Hamburger di bovino (250 gr.), pancetta coppata, provola delle Madonie, lattuga, pomodoro, salsa affumicata.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/cis-672x372.jpg', 30, true),
    (v_tenant_id, v_cat_id, 'texas-burger', 'Texas Burger', 'Hamburger di bovino (250 gr.), prosciutto Mandolino di Sicilia aromatizzato con spezie e aromi naturali, cheddar, uova a occhio di bue, lattuga, pomodoro, salsa affumicata.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/texas-885x1024.jpg', 40, true),
    (v_tenant_id, v_cat_id, 'big-burger', 'Big Burger', 'Hamburger di bovino (250 gr.), prosciutto cotto affumicato, provola dolce, cipolla confit, salsa agrodolce.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/big-1016x1024.jpg', 50, true),
    (v_tenant_id, v_cat_id, 'la-duchessa', 'La Duchessa', 'Hamburger di bovino (250 gr), bacon, pomodoro, mozzorella, cipolla, lattuga.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/duchessa.jpg', 60, true),
    (v_tenant_id, v_cat_id, 'carrozzella', 'Carrozzella', 'Hamburger di bovino (250 gr), bacon, salame piccante, funghi freschi, cipolla, emmenthal.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/big-1016x1024.jpg', 70, true),
    (v_tenant_id, v_cat_id, 'emanuela', 'Emanuela', 'Hamburger di bovino, crudo di Parma, salsa al tartufo, emmenthal, formaggio fresco spalmabile.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/04/emanuela-672x372.jpg', 80, true),
    (v_tenant_id, v_cat_id, 'simone', 'Simone', 'Hamburger di bovino (250 gr),speck, scamorza affumicata, pomodoro, lattuga.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/big-1016x1024.jpg', 90, true);

    -- Category: PANINI (Cunzatizzi)
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'panini-cunzatizzi', 'PANINI (Cunzatizzi)', 60, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'auriga', 'Auriga', 'Filetto di pollo panato, crudo di Parma, emmental, zucchine grigliate, rucola.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/cis.jpg', 0, true),
    (v_tenant_id, v_cat_id, 'veggie-burger', 'Veggie Burger', 'Hamburger di patata, zucchine, carote, pomodoro, lattuga, melenzane, salsa allo yogurt.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/veggie-962x1024.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'bronx', 'Bronx', 'Porchetta di nostra produzione, wurstel di maiale, melanzane, mozzarella, emmenthal.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/portafoglio.jpg', 20, true),
    (v_tenant_id, v_cat_id, 'caracas', 'Caracas', 'Pollo panato con erbe aromatiche, porchetta di nostra produzione, mozzarella fior di latte, cipolla, zucchine.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/caracas-1024x567.jpg', 30, true),
    (v_tenant_id, v_cat_id, 'claudia', 'Claudia', 'Crudo di Parma, pomodoro, melanzane grigliate, funghi freschi, mozzarella fior di latte, salsa tartufata.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/claudia-3.jpg', 40, true),
    (v_tenant_id, v_cat_id, 'desir', 'Desirè', 'Bresaola, grana padano, rucola, salsa rosa', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/madera-1024x1024.jpg', 50, true),
    (v_tenant_id, v_cat_id, 'dora', 'Dora', 'Salmone norvegese, mozzarella fior di latte, rucola selvatica, pomodoro.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/dora-3-1024x1024.jpg', 60, true),
    (v_tenant_id, v_cat_id, 'epoque', 'Epoque', 'Crudo di Parma, formaggio alle noci, lattuga, salsa rosa.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/macheda-1024x1024.jpg', 70, true),
    (v_tenant_id, v_cat_id, 'francescano', 'Francescano', 'Porchetta di nostra produzione con aromi, mozzarella fior di latte, funghi freschi, origano, pomodoro.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/francescano-672x372.jpg', 80, true),
    (v_tenant_id, v_cat_id, 'fum', 'Fumè', 'Prosciutto cotto affumicato, mozzarella fior di latte, funghi freschi.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/fume-3-1024x1024.jpg', 90, true),
    (v_tenant_id, v_cat_id, 'il-conte', 'Il Conte', 'Salsiccia di maiale, porchetta di nostra produzione, salame piccante, pomodoro, mozzarella fior di latte, melanzane.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/conte-4-672x372.jpg', 100, true),
    (v_tenant_id, v_cat_id, 'jumbolo', 'Jumbolo', 'Wurstel di maiale servelade di puro suino , prosciutto cotto, mozzarella fior di latte.', 7, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/fume-3-1024x1024.jpg', 110, true),
    (v_tenant_id, v_cat_id, 'liliana', 'Liliana', 'Salmone norvegese affumicato, gorgonzola, formaggio fuso spalmabile, rucola, melanzane, pomodoro.', 10, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/liliana-672x372.jpg', 120, true),
    (v_tenant_id, v_cat_id, 'macheda', 'Macheda', 'Crudo di Parma, mozzorella fior di latte, funghi freschi, pomodoro, lattuga.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/macheda-1024x1024.jpg', 130, true),
    (v_tenant_id, v_cat_id, 'madera', 'Madera', 'Bresaola, mozzarella fior di latte, pomodoro, lattuga, paté di olive, formaggi brie.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/madera-1024x1024.jpg', 140, true),
    (v_tenant_id, v_cat_id, 'marchese', 'Marchese', 'Salsiccia di maiale, prosciutto cotto, bacon, scamorza affumicata funghi freschi, paté di olive, pomodoro.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/marchese-2-672x372.jpg', 150, true),
    (v_tenant_id, v_cat_id, 'messicano', 'Messicano', 'Salsiccia, porchetta di nostra produzione, salame piccante, emmenthal, cipolla, zucchine.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/messican0-2-672x372.jpg', 160, true),
    (v_tenant_id, v_cat_id, 'nerone', 'Nerone', 'Prosciutto cotto, pancetta, funghi freschi, pomodoro, emmenthal.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/fume-3-1024x1024.jpg', 170, true),
    (v_tenant_id, v_cat_id, 'new-orleans', 'New Orleans', 'Crudo di Parma, mozzarella fior di latte, zucchine, funghi freschi, carote, pomodoro, melanzane.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/orleans-1-1024x767.jpg', 180, true),
    (v_tenant_id, v_cat_id, 'peleo', 'Peleo', 'Pollo panato, lattuga, pomodoro, grana Padano, mozzarella fior di latte.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/peleo-815x1024.jpg', 190, true),
    (v_tenant_id, v_cat_id, 'pierrot', 'Pierrot', 'Bresaola, mozzarella fior di latte, funghi freschi, pomodoro, rucola, salsa rosa.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/madera-1024x1024.jpg', 200, true),
    (v_tenant_id, v_cat_id, 'portafoglio', 'Portafoglio', 'Porchetta di nostra produzione, emmenthal, pomodoro.', 7, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/portafoglio.jpg', 210, true),
    (v_tenant_id, v_cat_id, 'profumo-di-sicilia', 'Profumo di Sicilia', 'Pomodoro, mozzarella fior di latte, rucola, basilico, grana padano, funghi freschi, melanzane.', 7, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/fume-3-1024x1024.jpg', 220, true),
    (v_tenant_id, v_cat_id, 'quattro-formaggi', 'Quattro formaggi', 'Salsiccia,porchetta di nostra produzione, gorgonzola, formaggio fresco spalmabile, mozzarella, emmenthal.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/francescano-1024x1024.jpg', 230, true),
    (v_tenant_id, v_cat_id, 'roast-beaf', 'Roast beaf', 'Roast beef di bovino di nostra produzione, pomodoro, lattuga, zucchine, mozzarella fior di latte, grana Padano.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/rosbif-3-1.jpg', 240, true),
    (v_tenant_id, v_cat_id, 'salsicciotto', 'Salsicciotto', 'Salsiccia di maiale, porchetta di nostra produzione, emmenthal, pomodoro, cipolla, funghi freschi.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/marchese-2-1024x842.jpg', 250, true),
    (v_tenant_id, v_cat_id, 'siciliano', 'Siciliano', 'Prosciutto cotto, bacon, salame piccante, funghi freschi, emmenthal.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/fume-3-1024x1024.jpg', 260, true),
    (v_tenant_id, v_cat_id, 'topolino', 'Topolino', 'Prosciutto cotto, wurstel di maiale servelade di puro suino, bacon, emmenthal, melanzane.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/marchese-2-1024x842.jpg', 270, true);

    -- Category: PIADINE DOC
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'piadine-doc', 'PIADINE DOC', 70, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'aida', 'Aida', 'Tritato di bovino, tritato di maiale, porchetta di nostra produzione, cipolla, aromi, emmenthal, salsa messicana.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/05/aida-1024x860.jpeg', 0, true),
    (v_tenant_id, v_cat_id, 'la-boheme', 'La Boheme', 'Roast beef di bovino di nostra produzione, pomodoro, lattuga, zucchine, emmenthal, grana padano.', 9, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/boehm-1024x862.jpg', 10, true),
    (v_tenant_id, v_cat_id, 'la-traviata', 'La Traviata', 'Crudo di Parma, zucchine, melanzane, funghi, mozzarella fior di latte, grana padano.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/traviata-2-1024x767.jpg', 20, true),
    (v_tenant_id, v_cat_id, 'turandot', 'Turandot', 'Bresaola, funghi freschi, zucchine, grana padano, rucola, mozzarella fior di latte.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/turando-2-1024x767.jpg', 30, true);

    -- Category: Kid Menu
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'kid-menu', 'Kid Menu', 80, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'goten', 'Goten', 'Hamburger di bovino, patatine, succo di frutta o acqua.', 7, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/GotenDBZ-1.webp', 0, true),
    (v_tenant_id, v_cat_id, 'vegeta', 'Vegeta', 'Pollo panato, patatine, succo di frutta o acqua.', 8, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/Vegeta_DBSSHero-637x1024.webp', 10, true),
    (v_tenant_id, v_cat_id, 'pikachu', 'Pikachu', 'Wurstel servelade di puro suino, patatine, succo di frutta o acqua.', 7, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/background-black-pikachu-pokemon-wallpaper-thumb.jpg', 20, true);

    -- Category: Dolce
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'dolce', 'Dolce', 90, true)
    RETURNING id INTO v_cat_id;

    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, image_url, display_order, is_visible)
    VALUES
    (v_tenant_id, v_cat_id, 'tortino-al-cioccolato', 'Tortino al cioccolato', 'Specialità di nostra produzione, gusto unico dai mille sapori grazie all’unione di tre cioccolati provenienti da tre Peasi diversi e con nocciole fresche.', 6, 'https://www.belleepoquepalermo.it/wp-content/uploads/2023/03/tortino-al-cioccolato-.jpg', 0, true);

END $$;
