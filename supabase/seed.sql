-- Development seed data for The Maintenance Tool.
--
-- All names, contact details, and notes below are FICTIONAL placeholder
-- data for local development. Replace with real records as you start
-- using the tool.
--
-- Idempotent: truncates first so re-running is safe in dev.
-- DO NOT run in production.

truncate
  public.email_draft,
  public.part_search,
  public.vendor,
  public.equipment
restart identity cascade;


-- =====================================================================
-- equipment
-- =====================================================================

insert into public.equipment (name, type, manufacturer, model, serial, install_date, location, notes) values
  ('Main Kitchen Dishwasher', 'dishwasher', 'Hobart', 'CL44e', 'HC44E-2019-08-A442',
   '2019-09-15', 'Kitchen — back wall',
   'Drain pump replaced 2024-03; runs hot in summer.'),
  ('Sauna Heater (Cedar Room)', 'sauna heater', 'Tylo', 'Combi-RC', 'TY-CR-9921',
   '2021-06-02', 'Cedar sauna',
   'Steam reservoir descaled quarterly.'),
  ('Hot Tub Filter Pump', 'pump', 'Pentair', 'IntelliFlo VS+SVRS', 'PEN-IF-44102',
   '2022-11-18', 'Hot tub mechanical room',
   'VFD throws E22 if water level drops below sensor.'),
  ('HVAC RTU – Treatment Wing', 'hvac', 'Carrier', 'WeatherMaker 50TC', 'CAR-50TC-77810',
   '2018-04-10', 'Roof, north',
   'Belt replacement on 6-month schedule.'),
  ('Towel Steamer', 'steamer', 'Steamspa', 'OASIS-100', 'SS-OAS-23119',
   '2023-02-22', 'Treatment room 4',
   'Element shows scale buildup.');


-- =====================================================================
-- vendor
-- =====================================================================

insert into public.vendor (name, type, email, phone, website, specialty, notes) values
  ('Pacific Restaurant Supply', 'supplier',
   'parts@pacrestaurant.example', '+1 604 555 0142',
   'https://pacificrestaurant.example',
   'commercial kitchen parts, dishwashers',
   'Best for Hobart and Champion. Same-day delivery in the Lower Mainland.'),
  ('Coastal Pool & Spa Equipment', 'supplier',
   'orders@coastalpool.example', '+1 604 555 0188',
   'https://coastalpool.example',
   'pool, spa, sauna, hot tub equipment and chemicals',
   'Carry Pentair, Tylo, Helo. Net 30 account on file.'),
  ('Marius Millwork', 'contractor',
   'shop@mariusmillwork.example', '+1 604 555 0203',
   'https://mariusmillwork.example',
   'custom millwork, solid timber, vanities',
   'Did the 140" main reception counter — quality was excellent. ~12 week lead.'),
  ('Riverbend HVAC', 'service',
   'service@riverbendhvac.example', '+1 604 555 0277',
   null,
   'commercial HVAC service and PM contracts',
   'Annual contract ~CAD 8,000 covers two RTUs.'),
  ('Northshore Electrical', 'service',
   'dispatch@northshoreelec.example', '+1 604 555 0411',
   null,
   'commercial electrical',
   'On call 24/7. Permit handling included.');


-- =====================================================================
-- part_search
-- =====================================================================
-- Subqueries reference the equipment rows inserted above. Within a
-- single transaction, prior INSERTs are visible to subsequent ones.

insert into public.part_search (input_text, results, equipment_id) values
  ('drain pump for Hobart CL44e dishwasher',
   '[
      {"part_number": "00897144-3", "supplier": "Pacific Restaurant Supply",
       "price_cad": 312.00, "url": "https://pacificrestaurant.example/00897144-3",
       "availability": "in stock"},
      {"part_number": "HOBA-DP-44E", "supplier": "Parts Town",
       "price_cad": 295.50, "url": "https://partstown.example/HOBA-DP-44E",
       "availability": "ships in 2 days"},
      {"part_number": "00897144", "supplier": "Hobart OEM Direct",
       "price_cad": 358.00, "url": "https://hobartoem.example/00897144",
       "availability": "in stock"}
   ]'::jsonb,
   (select id from public.equipment where name = 'Main Kitchen Dishwasher')),
  ('replacement element for Steamspa OASIS-100',
   '[
      {"part_number": "OAS-EL-100", "supplier": "Coastal Pool & Spa Equipment",
       "price_cad": 187.00, "url": "https://coastalpool.example/OAS-EL-100",
       "availability": "in stock"},
      {"part_number": "STM-OASIS-EL", "supplier": "Steamspa Direct",
       "price_cad": 165.00, "url": "https://steamspa.example/parts",
       "availability": "ships in 5 days"}
   ]'::jsonb,
   (select id from public.equipment where name = 'Towel Steamer'));


-- =====================================================================
-- email_draft
-- =====================================================================

insert into public.email_draft (
  recipient_email, subject, body, vendor_id, context_type, status
) values
  ('parts@pacrestaurant.example',
   'Hobart CL44e drain pump — quote and ETA',
   E'Hi,\n\nLooking to source a drain pump for our Hobart CL44e (serial HC44E-2019-08-A442). Looking at part 00897144-3.\n\nCould you confirm:\n- price + CAD total with shipping to V6Z 2N9\n- ship date\n- whether the part is OEM or aftermarket\n\nThanks,\nDaniel',
   (select id from public.vendor where name = 'Pacific Restaurant Supply'),
   'part_search',
   'draft');
