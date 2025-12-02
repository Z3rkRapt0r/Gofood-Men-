-- ============================================================
-- SEED DATA: 14 ALLERGENI EU
-- ============================================================
-- Version: 1.0.0
-- Description: Dati allergeni conformi a EU Regulation 1169/2011
-- Database: PostgreSQL (Supabase)
-- ============================================================

-- Inserimento 14 allergeni obbligatori EU
INSERT INTO public.allergens (id, number, icon, name, description) VALUES
  (
    'glutine',
    1,
    '🌾',
    '{"it": "Cereali contenenti glutine", "en": "Cereals containing gluten"}'::jsonb,
    '{"it": "Grano, segale, orzo, avena, farro, kamut o loro ceppi ibridati, e prodotti derivati", "en": "Wheat, rye, barley, oats, spelt, kamut or their hybridised strains, and products thereof"}'::jsonb
  ),
  (
    'crostacei',
    2,
    '🦐',
    '{"it": "Crostacei e prodotti a base di crostacei", "en": "Crustaceans and products thereof"}'::jsonb,
    '{"it": "Gamberi, scampi, aragoste, granchi e prodotti derivati", "en": "Prawns, shrimp, lobsters, crabs and products thereof"}'::jsonb
  ),
  (
    'uova',
    3,
    '🥚',
    '{"it": "Uova e prodotti a base di uova", "en": "Eggs and products thereof"}'::jsonb,
    '{"it": "Tutte le preparazioni contenenti uova", "en": "All preparations containing eggs"}'::jsonb
  ),
  (
    'pesce',
    4,
    '🐟',
    '{"it": "Pesce e prodotti a base di pesce", "en": "Fish and products thereof"}'::jsonb,
    '{"it": "Tutti i tipi di pesce e preparazioni derivate", "en": "All types of fish and derived preparations"}'::jsonb
  ),
  (
    'arachidi',
    5,
    '🥜',
    '{"it": "Arachidi e prodotti a base di arachidi", "en": "Peanuts and products thereof"}'::jsonb,
    '{"it": "Noccioline americane e tutti i prodotti derivati", "en": "Peanuts and all derived products"}'::jsonb
  ),
  (
    'soia',
    6,
    '🫘',
    '{"it": "Soia e prodotti a base di soia", "en": "Soybeans and products thereof"}'::jsonb,
    '{"it": "Fagioli di soia e prodotti derivati", "en": "Soybeans and derived products"}'::jsonb
  ),
  (
    'lattosio',
    7,
    '🥛',
    '{"it": "Latte e prodotti a base di latte", "en": "Milk and products thereof"}'::jsonb,
    '{"it": "Incluso il lattosio, formaggi, burro, yogurt e derivati", "en": "Including lactose, cheese, butter, yogurt and derivatives"}'::jsonb
  ),
  (
    'frutta-secca',
    8,
    '🌰',
    '{"it": "Frutta a guscio", "en": "Nuts"}'::jsonb,
    '{"it": "Mandorle, nocciole, noci, anacardi, pecan, pistacchi e prodotti derivati", "en": "Almonds, hazelnuts, walnuts, cashews, pecans, pistachios and products thereof"}'::jsonb
  ),
  (
    'sedano',
    9,
    '🌿',
    '{"it": "Sedano e prodotti a base di sedano", "en": "Celery and products thereof"}'::jsonb,
    '{"it": "Sedano e preparazioni derivate", "en": "Celery and derived preparations"}'::jsonb
  ),
  (
    'senape',
    10,
    '🌭',
    '{"it": "Senape e prodotti a base di senape", "en": "Mustard and products thereof"}'::jsonb,
    '{"it": "Semi di senape e prodotti derivati", "en": "Mustard seeds and derived products"}'::jsonb
  ),
  (
    'sesamo',
    11,
    '○',
    '{"it": "Semi di sesamo e prodotti a base di semi di sesamo", "en": "Sesame seeds and products thereof"}'::jsonb,
    '{"it": "Semi di sesamo e prodotti derivati", "en": "Sesame seeds and derived products"}'::jsonb
  ),
  (
    'solfiti',
    12,
    '⚗️',
    '{"it": "Anidride solforosa e solfiti", "en": "Sulphur dioxide and sulphites"}'::jsonb,
    '{"it": "In concentrazioni superiori a 10 mg/kg o 10 mg/litro in prodotti come vino", "en": "At concentrations of more than 10 mg/kg or 10 mg/litre in products such as wine"}'::jsonb
  ),
  (
    'lupini',
    13,
    '🫘',
    '{"it": "Lupini e prodotti a base di lupini", "en": "Lupin and products thereof"}'::jsonb,
    '{"it": "Lupini e prodotti derivati", "en": "Lupin and derived products"}'::jsonb
  ),
  (
    'molluschi',
    14,
    '🦪',
    '{"it": "Molluschi e prodotti a base di molluschi", "en": "Molluscs and products thereof"}'::jsonb,
    '{"it": "Vongole, cozze, ostriche, calamari e prodotti derivati", "en": "Clams, mussels, oysters, squid and derived products"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Verifica inserimento
DO $$
DECLARE
  allergen_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO allergen_count FROM public.allergens;

  IF allergen_count = 14 THEN
    RAISE NOTICE '✅ 14 allergeni EU inseriti correttamente';
  ELSE
    RAISE WARNING '⚠️  Attenzione: trovati % allergeni invece di 14', allergen_count;
  END IF;
END $$;

-- ============================================================
-- FINE SEED DATA
-- ============================================================
