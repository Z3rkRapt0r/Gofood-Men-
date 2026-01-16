
-- Migration Script for Magna Roma Menu
-- Generated automatically
-- REPLACE 'REPLACE_WITH_TENANT_ID' with the actual Tenant UUID

DO $$
DECLARE
    v_tenant_id uuid := 'b16564b1-8c1a-45e7-bca6-bd59f6a3b06e';
    v_cat_id uuid;
BEGIN
    -- Ensure tenant exists or error out if invalid UUID (handled by Postgres runtime)
    -- Start Transaction

    -- Category: Per cominciare
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'per-cominciare', 'Per cominciare', 0, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'tagliere-magna-rom', 'Tagliere Magna Romā', 'Tagliere con salumi e formaggi per due persone', 20.00, ARRAY['lattosio','frutta-secca'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'patate-magna-rom', 'Patate Magna Romā', 'Patate fritte scavate con crema di pecorino', 6.50, ARRAY['glutine','lattosio'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'arrosticini-della-casa', 'Arrosticini della Casa', 'Arrosticini di carne ovina (10 pz) con patate al forno, sale, pepe, olio E.V.O. aromatizzati al rosmarino', 14.00, ARRAY[]::text[], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'mozzarella-in-carrozza', 'Mozzarella in Carrozza', 'Fette di pane in cassetta, mozzarella fiordilatte, uova, con o senza alici, panate e fritte (2 pz)', 6.50, ARRAY['glutine','uova','pesce','soia','lattosio'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tagliere-del-porchettaro', 'Tagliere del Porchettaro', 'Porchetta, aromi, con assaggi di pecorino e miele, pepe, sfumata con vino bianco', 15.00, ARRAY['lattosio','solfiti'], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'fritti-romani-in-pastella', 'Fritti Romani in Pastella', 'Fiori di zucca con mozzarella fiordilatte, alici, melanzane, zucchine, patate in pastella', 6.50, ARRAY['glutine','crostacei','uova','pesce','arachidi','soia','lattosio','frutta-secca','sedano','senape','sesamo','solfiti','lupini','molluschi'], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'trippa-romana', 'Trippa Romana', 'Trippa, salsa di pomodoro, sedano, carote, cipolla, pecorino, menta, vino bianco, olio E.V.O., pepe', 11.00, ARRAY['lattosio','sedano','solfiti'], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'suppl', 'Supplì', 'Riso, tritato di manzo e maiale, salsa di pomodoro, cipolla, sedano, carote, alloro, mozzarella fiordilatte, vino bianco, grana (2 pz)', 6.00, ARRAY['glutine','lattosio','frutta-secca','sedano','solfiti'], 70, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'fagioli-con-le-cotiche', 'Fagioli con le Cotiche', 'Fagioli, cotiche di maiale, sedano, salsa di pomodoro, cipolla, carote, pepe, prezzemolo, vino bianco, olio E.V.O.', 9.00, ARRAY['sedano','solfiti'], 80, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'filetti-di-baccal-in-pastella', 'Filetti di Baccalà in Pastella', 'Filetti di baccalà fritti in pastella', 9.00, ARRAY['glutine','pesce','lupini'], 90, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'polpette-al-sugo-alla-giannone', 'Polpette al Sugo alla Giannone', 'Tritato di manzo e maiale, salsa di pomodoro, grana, cipolla, uova, latte, pangrattato, basilico, prezzemolo', 9.00, ARRAY['glutine','uova','lattosio'], 100, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'solo-fiori', 'Solo Fiori', 'Fiori di zucca con mozzarella, alici in pastella (4 pz)', 8.00, ARRAY['glutine','crostacei','uova','pesce','arachidi','soia','lattosio','frutta-secca','sedano','senape','sesamo','solfiti','lupini','molluschi'], 110, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'carciofi-alla-romana', 'Carciofi alla Romana', 'Fuori stagione', 7.00, ARRAY['lattosio','pesce'], 120, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'carciofo-alla-giudia', 'Carciofo alla Giudia', 'Fuori stagione', 6.00, ARRAY['glutine'], 130, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'carpaccio-di-manzo', 'Carpaccio di Manzo', 'Carpaccio di manzo, rucola, olio, sale e pepe, scaglie di grana', 10.00, ARRAY['lattosio'], 140, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'sformato-di-melanzane', 'Sformato di Melanzane', 'Salsa di pomodoro, melanzane fritte, scamorza bianca, mozzarella fiordilatte, basilico, grana', 8.00, ARRAY['lattosio'], 150, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'puntarelle-alla-romana', 'Puntarelle alla Romana', 'Germogli di cicoria con battuto di olio E.V.O., aceto di vino, acciughe, pepe - Secondo la stagione', 9.00, ARRAY['pesce','solfiti'], 160, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'crudo-e-bufala', 'Crudo e Bufala', 'Prosciutto crudo, mozzarella di bufala', 11.00, ARRAY['lattosio'], 170, true, false, false, false, false, false, false);

    -- Category: Bruschette
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'bruschette', 'Bruschette', 10, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'bruschetta-tradizionale', 'Bruschetta Tradizionale', 'Pomodoro a dadini, aglio, olio EVO, sale, basilico, pepe', 5.50, ARRAY['glutine'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'lardo-e-miele', 'Lardo e Miele', 'Lardo pancettato, miele, rosmarino', 6.50, ARRAY['glutine'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'stracciatella-e-alici', 'Stracciatella e Alici', 'Stracciatella, alici, scorza di limone', 6.50, ARRAY['glutine','pesce','lattosio'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'salmone-e-rucola', 'Salmone e Rucola', 'Salmone, rucola, stracciatella, olio EVO, pepe', 7.50, ARRAY['glutine','pesce','lattosio'], 30, true, false, false, false, false, false, false);

    -- Category: I Primi
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'i-primi', 'I Primi', 20, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'tonnarello-alla-checca', 'Tonnarello alla Checca', 'Salsa di pomodoro, pomodorino, stracciatella, basilico, peperoncino, pepe', 12.00, ARRAY['glutine','lattosio'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-broccoli-e-salsiccia', 'Tonnarello Broccoli e Salsiccia', 'Broccoletti, salsiccia, cipolla, pecorino, menta, pepe', 13.00, ARRAY['glutine','lattosio'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'la-fagioli-e-cotiche', 'La Fagioli e Cotiche', 'Pasta mista, fagioli, cotiche di maiale, salsa di pomodoro, carote, cipolle, sedano, vino bianco, prezzemolo, olio E.V.O., pepe', 11.00, ARRAY['glutine','sedano','solfiti'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'raviolacci-ai-carciofi', 'Raviolacci ai Carciofi', 'Ravioli ripieni di ricotta e carciofi, burro, salvia, pecorino, pepe', 14.00, ARRAY['glutine','crostacei','uova','pesce','arachidi','soia','lattosio','frutta-secca','sedano','senape','sesamo','solfiti','lupini','molluschi'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'gnocchi-burro-e-salvia', 'Gnocchi Burro e Salvia', 'Burro, salvia, pecorino, pepe', 11.00, ARRAY['glutine','lattosio'], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-alle-vongole', 'Tonnarello alle Vongole', 'Vongole, olio E.V.O., aglio, vino bianco, prezzemolo, pepe', 18.00, ARRAY['glutine','solfiti','molluschi'], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'fettuccine-impero', 'Fettuccine Impero', 'Aragostina, salsa di pomodoro, pomodorini, sfumata al vino, prezzemolo, aglio, menta, pepe', 20.00, ARRAY['glutine','crostacei','solfiti'], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'mezzi-rigatoni-alla-vignarola', 'Mezzi Rigatoni alla Vignarola', 'Fave, piselli, crema di carciofi, cipolla, guanciale, scaglie di pecorino, pepe', 14.00, ARRAY['glutine','lattosio'], 70, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'mezzi-rigatoni-alla-zozzona', 'Mezzi Rigatoni alla Zozzona', 'Salsiccia, guanciale, cipolla, salsa di pomodoro, pomodorini, vino bianco, uova pastorizzate, pecorino, pepe, peperoncino', 14.00, ARRAY['glutine','uova','lattosio','solfiti'], 80, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-magna-rom', 'Tonnarello Magna Romā', 'Guanciale, funghi porcini, crema di carciofi, aglio, vino bianco, scaglie di pecorino, prezzemolo, pepe', 14.00, ARRAY['glutine','lattosio','sedano','solfiti'], 90, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-sora-norma', 'Tonnarello Sora Norma', 'Salsa di pomodoro, melanzane fritte, basilico, sale, pepe, pecorino a scaglie, peperoncino', 11.00, ARRAY['glutine','lattosio'], 100, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'fettuccine-alla-magnona', 'Fettuccine alla Magnona', 'Tritato di manzo e maiale, cipolla, sedano, carote, salsa di pomodoro, funghi champignon, pepe, vino rosso', 14.00, ARRAY['glutine','lattosio','sedano','solfiti'], 110, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'mezzi-rigatoni-alla-buttarona', 'Mezzi Rigatoni alla Buttarona', 'Salsiccia, cotenna di maiale, salsa di pomodoro, guanciale, vino bianco, cipolla, pepe', 14.00, ARRAY['glutine','solfiti'], 120, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-al-sugo-di-coda-alla-vaccinara', 'Tonnarello al Sugo di Coda alla Vaccinara', 'Coda di manzo, pomodoro pelato, cipolla, carota, sedano, pepe, vino rosso, olio E.V.O.', 14.00, ARRAY['glutine','sedano','solfiti'], 130, true, false, false, false, false, false, false);

    -- Category: I Primi della Tradizione
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'i-primi-della-tradizione', 'I Primi della Tradizione', 30, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'tonnarello-cacio-e-pepe', 'Tonnarello Cacio e Pepe', 'Pecorino, pepe, serviti in cialda di pecorino', 12.50, ARRAY['glutine','lattosio'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-alla-carbonara', 'Tonnarello alla Carbonara', 'Guanciale, uova pastorizzate, pecorino, pepe, serviti in cialda di pecorino', 12.50, ARRAY['glutine','uova','lattosio'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-alla-amatriciana', 'Tonnarello alla Amatriciana', 'Salsa di pomodoro, guanciale, pecorino, pepe', 12.50, ARRAY['glutine','lattosio','solfiti'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tonnarello-alla-gricia', 'Tonnarello alla Gricia', 'Guanciale, vino bianco, pecorino, pepe', 12.50, ARRAY['glutine','lattosio','solfiti'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'bis-della-tradizione', 'Bis della Tradizione', 'Due tipologie di pasta a scelta tra i primi della tradizione, servite nello stesso piatto - Minimo per due persone', 14.00, ARRAY['glutine','uova','lattosio','solfiti'], 40, true, false, false, false, false, false, false);

    -- Category: I Secondi
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'i-secondi', 'I Secondi', 40, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'abbacchio-scottadito', 'Abbacchio Scottadito', 'Costolette di abbacchio ai ferri con patate al forno, rosmarino, olio E.V.O.', 17.00, ARRAY[]::text[], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'scaloppine-al-vino-o-limone', 'Scaloppine al Vino o Limone', 'Carne di manzo saltata in padella al limone o al vino, con burro, farina, contorno di patate al forno, olio E.V.O., pepe', 13.00, ARRAY['glutine','lattosio','solfiti'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'scaloppine-ai-funghi', 'Scaloppine ai Funghi', 'Carne di manzo saltata in padella, funghi champignon, burro, farina, vino bianco, olio E.V.O., pepe', 15.00, ARRAY['glutine','lattosio','solfiti'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'coda-alla-vaccinara', 'Coda alla Vaccinara', 'Coda di manzo, pomodoro pelato, sedano, carote, cipolla, sfumata al vino rosso, olio E.V.O.', 16.00, ARRAY['sedano','solfiti'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'saltimbocca-alla-romana', 'Saltimbocca alla Romana', 'Carne di manzo saltata in padella con burro, farina, prosciutto crudo, salvia sfumata con vino bianco, con contorno di patate al forno, olio E.V.O. e pepe', 14.00, ARRAY['glutine','lattosio','solfiti'], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'gran-tagliere-della-casa', 'Gran Tagliere della Casa', 'Costolette di abbacchio scottadito, salsiccia, arrosticini, porchetta, carne alla Picchiapo, patate al forno e fritte, trincià romani, crema di pecorino, peperoncino, pepe', 28.00, ARRAY['glutine','lattosio','solfiti'], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'spadellata-di-salsiccia-e-patate', 'Spadellata di Salsiccia e Patate', 'Salsiccia, patate, cipolla, rosmarino, sale, pepe, olio E.V.O.', 12.00, ARRAY[]::text[], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'baccal-alla-giudia', 'Baccalà alla Giudia', 'Baccalà cotto in salsa di pomodoro, pomodorini, peperoncino, menta, prezzemolo, aglio, olio E.V.O.', 14.00, ARRAY['glutine','pesce'], 70, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'carne-alla-picchiapo', 'Carne alla Picchiapo', 'Carne di manzo, salsa di pomodoro, vino bianco, cipolla, olio E.V.O., menta, peperoncino', 12.00, ARRAY['solfiti'], 80, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tagliata-di-filetto', 'Tagliata di Filetto', 'Tagliata di filetto di manzo all''aceto balsamico o al rosmarino, con contorno di patate al forno, pepe', 20.00, ARRAY['solfiti'], 90, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'calamaro-arrosto', 'Calamaro Arrosto', 'Calamaro arrostito al salmoriglio con insalarina e patate al forno', 16.00, ARRAY['pesce'], 100, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'filetto-ai-funghi', 'Filetto ai Funghi', 'Filetto, funghi champignon, burro, farina, pepe, sfumato con sambuca romana', 22.00, ARRAY['glutine','lattosio','solfiti'], 110, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'bistecca-di-manzo', 'Bistecca di Manzo', 'Bistecca di manzo ai ferri o panata', 14.00, ARRAY[]::text[], 120, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'petto-di-pollo', 'Petto di Pollo', 'Petto di pollo ai ferri, panato o cotoletta', 10.00, ARRAY['glutine','uova'], 130, true, false, false, false, false, false, false);

    -- Category: Pinse Romane
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'pinse-romane', 'Pinse Romane', 50, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'giulio-cesare', 'Giulio Cesare', 'Prosciutto crudo, stracciatella, pomodorini caramellati, miele', 14.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'mortazza', 'Mortazza', 'Mortadella, burrata, granella di pistacchi', 13.00, ARRAY['glutine','arachidi','soia','lattosio','frutta-secca','senape'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'romana', 'Romana', 'Salsa di pomodoro, mozzarella fiordilatte, prosciutto cotto, origano', 10.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'amatriciana', 'Amatriciana', 'Salsa di pomodoro, scaglie di pecorino, guanciale croccante, mozzarella fiordilatte, pepe', 11.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'buciarda', 'Buciarda', 'Salsa di pomodoro, mozzarella di bufala, basilico, origano', 10.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'der-pupone', 'Der Pupone', 'Salsa di pomodoro, pomodorino, mozzarella di bufala, basilico, origano', 11.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'bruciacculo', 'Bruciacculo', 'Salsa di pomodoro, salame piccante, mozzarella fiordilatte, melanzane fritte, scaglie di grana, pomodorino, pepe', 13.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'cuppolone', 'Cuppolone', 'Salsa di pomodoro, mozzarella fiordilatte, porchetta, miele, scaglie di pecorino, pepe', 13.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 70, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'sora-lella', 'Sora Lella', 'Prosciutto crudo, mozzarella di bufala, crema di fichi', 13.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 80, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'magna-roma', 'Magna Roma''', 'Mozzarella fiordilatte, crema di carciofi, guanciale croccante, funghi porcini, scaglie di pecorino, pepe, aglio', 14.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 90, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'la-caciarona', 'La Caciarona', 'Salsa di pomodoro, prosciutto cotto, funghi champignon, carciofi, mozzarella fiordilatte, olio E.V.O., olive, origano', 13.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 100, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'villa-borghese', 'Villa Borghese', 'Speck, crema di radicchio, noci, stracciatella', 13.00, ARRAY['glutine','arachidi','soia','lattosio','frutta-secca','senape','solfiti'], 110, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'la-fiatella', 'La Fiatella', 'Salsa di pomodoro, mozzarella fiordilatte, tonno, cipolla, olive, olio E.V.O., pepe', 12.00, ARRAY['glutine','arachidi','soia','lattosio','senape'], 120, true, false, false, false, false, false, false);

    -- Category: Contorni
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'contorni', 'Contorni', 60, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'cicoria-in-padella', 'Cicoria in Padella', 'Cicoria in padella con olio E.V.O., aglio, peperoncino - Fresca in base alla stagione', 7.00, ARRAY[]::text[], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'verdure-grigliate', 'Verdure Grigliate', 'Zucchinette, melanzane, pomodoro, radicchio, funghi, prezzemolo', 7.00, ARRAY[]::text[], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'patate-al-forno', 'Patate al Forno', 'Patate, rosmarino, sale, olio E.V.O.', 6.00, ARRAY[]::text[], 20, true, false, false, false, false, false, false);

    -- Category: Insalate
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'insalate', 'Insalate', 70, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'insalatona-della-casa', 'Insalatona della Casa', 'Pomodorini, tonno, rucola, mais, olive, noci, iceberg, mozzarella fiordilatte, uova sode (altri ingredienti su richiesta)', 10.00, ARRAY['uova','pesce','lattosio','frutta-secca'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'insalata-mista', 'Insalata Mista', 'Iceberg, rucola e pomodorini', 6.00, ARRAY[]::text[], 10, true, false, false, false, false, false, false);

    -- Category: Dolci
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'dolci', 'Dolci', 80, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'tiramis-scomposto', 'Tiramisù Scomposto', 'Mascarpone, uova pastorizzate, zucchero, cacao, caffè, savoiardi', 7.00, ARRAY['glutine','uova','lattosio'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'panna-cotta', 'Panna Cotta', 'Panna, zucchero, vanillina, gelatina alimentare, guarnita a scelta tra: nutella, cioccolato, fragola, frutti di bosco, caramello', 6.00, ARRAY['glutine','uova','lattosio'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tortino-ricotta-e-pere', 'Tortino Ricotta e Pere', 'Farina 00, zucchero, uova, vanillina, ricotta, panna montata, pere', 6.00, ARRAY['glutine','uova','lattosio'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'tortino-cuore-caldo-al-cioccolato', 'Tortino Cuore Caldo al Cioccolato', 'Farina 00, zucchero, uova, vanillina, cioccolato fondente, cacao, lievito', 7.00, ARRAY['glutine','uova','lattosio'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'crostata-di-visciole', 'Crostata di Visciole', 'Farina 00, uova, zucchero, vanillina, burro, marmellata di visciole', 7.00, ARRAY['glutine','uova','lattosio'], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'sorbetto-al-limone', 'Sorbetto al Limone', 'Acqua, zucchero, limone', 3.00, ARRAY[]::text[], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'frutta-di-stagione', 'Frutta di Stagione', 'Frutta fresca di stagione', 5.00, ARRAY[]::text[], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'sbriciolata', 'Sbriciolata', 'Farina 00, uova pastorizzate, zucchero, panna, limone, sfoglia guarnita a scelta tra: nutella, cioccolato, fragola, frutti di bosco, caramello', 6.00, ARRAY['glutine','uova','lattosio'], 70, true, false, false, false, false, false, false);

    -- Category: Il Bere della Casa
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'il-bere-della-casa', 'Il Bere della Casa', 90, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'vino-rosso-magna-rom-375ml', 'Vino Rosso Magna Romā 375ml', 'Vino della casa ''Il Rosso'' - Per una scelta completa, consulta la nostra carta dei vini', 6.00, ARRAY['solfiti'], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'vino-bianco-magna-rom-375ml', 'Vino Bianco Magna Romā 375ml', 'Vino della casa ''Il Bianco'' - Per una scelta completa, consulta la nostra carta dei vini', 6.00, ARRAY['solfiti'], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'vino-rosso-magna-rom-750ml', 'Vino Rosso Magna Romā 750ml', 'Vino della casa ''Il Rosso'' - Per una scelta completa, consulta la nostra carta dei vini', 10.00, ARRAY['solfiti'], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'vino-bianco-magna-rom-750ml', 'Vino Bianco Magna Romā 750ml', 'Vino della casa ''Il Bianco'' - Per una scelta completa, consulta la nostra carta dei vini', 10.00, ARRAY['solfiti'], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'vino-frizzante-magna-rom-750ml', 'Vino Frizzante Magna Romā 750ml', 'Vino della casa ''Il Frizzante'' - Per una scelta completa, consulta la nostra carta dei vini', 12.00, ARRAY['solfiti'], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'calice-magna-rom', 'Calice Magna Romā', 'Calice di vino della casa', 3.50, ARRAY['solfiti'], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'calice-in-bottiglia', 'Calice in Bottiglia', 'Calice di vino in bottiglia', 5.00, ARRAY['solfiti'], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-bionda-alla-spina-20cl', 'Birra Bionda alla Spina 20cl', 'Birra bionda alla spina', 3.50, ARRAY['glutine'], 70, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-bionda-alla-spina-40cl', 'Birra Bionda alla Spina 40cl', 'Birra bionda alla spina', 5.50, ARRAY['glutine'], 80, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-bionda-weiss-alla-spina-20cl', 'Birra Bionda Weiss alla Spina 20cl', 'Birra bionda Weiss alla spina', 4.00, ARRAY['glutine'], 90, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-bionda-weiss-alla-spina-40cl', 'Birra Bionda Weiss alla Spina 40cl', 'Birra bionda Weiss alla spina', 6.50, ARRAY['glutine'], 100, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-rossa-alla-spina-20cl', 'Birra Rossa alla Spina 20cl', 'Birra rossa alla spina', 4.00, ARRAY['glutine'], 110, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-rossa-alla-spina-40cl', 'Birra Rossa alla Spina 40cl', 'Birra rossa alla spina', 6.50, ARRAY['glutine'], 120, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-analcolica-33cl', 'Birra Analcolica 33cl', 'Birra analcolica in bottiglia', 3.50, ARRAY[]::text[], 130, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-senza-glutine-33cl', 'Birra Senza Glutine 33cl', 'Birra senza glutine in bottiglia', 3.50, ARRAY[]::text[], 140, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-artigianale-magna-rom-bionda-55-33cl', 'Birra Artigianale Magna Romā Bionda 5,5° 33cl', 'Birra artigianale Magna Romā Bionda 5,5°', 3.50, ARRAY['glutine'], 150, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-artigianale-magna-rom-weiss-5-33cl', 'Birra Artigianale Magna Romā Weiss 5° 33cl', 'Birra artigianale Magna Romā Weiss 5°', 3.50, ARRAY['glutine'], 160, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-artigianale-magna-rom-rossa-5-33cl', 'Birra Artigianale Magna Romā Rossa 5° 33cl', 'Birra artigianale Magna Romā Rossa 5°', 3.50, ARRAY['glutine'], 170, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'birra-artigianale-magna-rom-strong-73-33cl', 'Birra Artigianale Magna Romā Strong 7,3° 33cl', 'Birra artigianale Magna Romā Strong 7,3°', 4.50, ARRAY['glutine'], 180, true, false, false, false, false, false, false);

    -- Category: Bevande
    INSERT INTO categories (tenant_id, slug, name, display_order, is_visible)
    VALUES (v_tenant_id, 'bevande', 'Bevande', 100, true)
    RETURNING id INTO v_cat_id;
  
    INSERT INTO dishes (tenant_id, category_id, slug, name, description, price, allergen_ids, display_order, is_visible, is_gluten_free, is_vegetarian, is_vegan, is_seasonal, is_frozen, is_homemade)
    VALUES
    (v_tenant_id, v_cat_id, 'acqua-in-vetro-75cl', 'Acqua in Vetro 75cl', 'Acqua in bottiglia di vetro', 2.50, ARRAY[]::text[], 0, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'coca-cola-vetro-33cl', 'Coca Cola Vetro 33cl', 'Coca Cola in bottiglia di vetro', 2.00, ARRAY[]::text[], 10, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'coca-cola-zero-vetro-33cl', 'Coca Cola Zero Vetro 33cl', 'Coca Cola Zero in bottiglia di vetro', 2.00, ARRAY[]::text[], 20, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'fanta-vetro-33cl', 'Fanta Vetro 33cl', 'Fanta in bottiglia di vetro', 2.00, ARRAY[]::text[], 30, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'chinotto-vetro-33cl', 'Chinotto Vetro 33cl', 'Chinotto in bottiglia di vetro', 2.00, ARRAY[]::text[], 40, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'sprite-vetro-33cl', 'Sprite Vetro 33cl', 'Sprite in bottiglia di vetro', 2.00, ARRAY[]::text[], 50, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'kinley-lemon-o-tonica-33cl', 'Kinley Lemon o Tonica 33cl', 'Kinley lemon o tonica', 2.00, ARRAY[]::text[], 60, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'th-alla-pesca-o-al-limone-33cl', 'Thè alla Pesca o al Limone 33cl', 'Thè freddo alla pesca o al limone', 2.00, ARRAY[]::text[], 70, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'caff', 'Caffè', 'Caffè espresso', 1.50, ARRAY[]::text[], 80, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'caff-decaffeinato', 'Caffè Decaffeinato', 'Caffè decaffeinato', 2.00, ARRAY[]::text[], 90, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'amari', 'Amari', 'Selezione di amari', 4.00, ARRAY[]::text[], 100, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'amari-speciali', 'Amari Speciali', 'Selezione di amari speciali', 5.00, ARRAY[]::text[], 110, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'amaro-magna-rom', 'Amaro Magna Romā', 'Amaro Averna, rosmarino, salvia, menta, scorza di agrumi', 6.00, ARRAY[]::text[], 120, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'distillati', 'Distillati', 'Selezione di distillati', 5.00, ARRAY[]::text[], 130, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'aperol-spritz', 'Aperol Spritz', 'Aperol, prosecco', 7.00, ARRAY['solfiti'], 140, true, false, false, false, false, false, false),
    (v_tenant_id, v_cat_id, 'spritz-magna-rom', 'Spritz Magna Romā', 'Cynar, prosecco, sprite, limone, menta, salvia', 7.00, ARRAY['solfiti'], 150, true, false, false, false, false, false, false);

END $$;
