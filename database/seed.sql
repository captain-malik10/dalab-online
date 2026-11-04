-- Dalab Online — demo data (matches database/schema.sql)
-- Passwords are bcrypt hashes generated with scripts/hash-passwords.js.
--
-- Customer / admin logins (/login):
--   Admin:     admin@dalab.test     / Admin123!
--   Customer:  faadumo@dalab.test   / Customer123!
--   Customer:  cabdi@dalab.test     / Customer123!
-- Vendor accounts (each owns two stores):
--   Ayaan Warsame  ayaan@dalab.test  / Vendor123!  -> Hodan Electronics, Bakaaro Home & Kitchen
--   Sahra Nuur     sahra@dalab.test  / Vendor123!  -> Xamar Fashion House, Lido Beauty
-- Store logins (/store), password Vendor123!:
--   hodan.electronics@dalab.test, bakaaro.home@dalab.test,
--   xamar.fashion@dalab.test, lido.beauty@dalab.test

INSERT INTO Users (id, name, email, password, phone, role) VALUES
(1, 'Dalab Admin', 'admin@dalab.test', '$2b$10$R6z7VgLrsjbv48kEVdqLfutVTGasd6tz6La.rrA6Iy3xudMQgFSGi', '+252610100100', 'admin'),
(2, 'Ayaan Warsame', 'ayaan@dalab.test', '$2b$10$2ps.RC6I0Mpvgm2o72hYEuHaoeFdaPVUFnsMlX65CyoQER0BocTDC', '+252617202020', 'vendor'),
(3, 'Sahra Nuur', 'sahra@dalab.test', '$2b$10$2ps.RC6I0Mpvgm2o72hYEuHaoeFdaPVUFnsMlX65CyoQER0BocTDC', '+252627303030', 'vendor'),
(4, 'Faadumo Cali', 'faadumo@dalab.test', '$2b$10$xWeETIPpHtVpZsC6rna.w.3KVcdxzTUSzq/ivebPkavTGHdttdRS.', '+252615404040', 'customer'),
(5, 'Cabdi Maxamed', 'cabdi@dalab.test', '$2b$10$xWeETIPpHtVpZsC6rna.w.3KVcdxzTUSzq/ivebPkavTGHdttdRS.', '+252625505050', 'customer');

INSERT INTO Vendors (id, user_id, email, password, store_name, description, isVerified, country, city, district, logo_url, license_url, status) VALUES
(1, 2, 'hodan.electronics@dalab.test', '$2b$10$2ps.RC6I0Mpvgm2o72hYEuHaoeFdaPVUFnsMlX65CyoQER0BocTDC', 'Hodan Electronics',
 'Phones, laptops and smart accessories with 6-month shop warranty. Free setup and SIM activation in store.',
 TRUE, 'Somalia', 'Mogadishu', 'Hodan', '/seed/smartphone.svg', NULL, 'approved'),
(2, 3, 'xamar.fashion@dalab.test', '$2b$10$2ps.RC6I0Mpvgm2o72hYEuHaoeFdaPVUFnsMlX65CyoQER0BocTDC', 'Xamar Fashion House',
 'Modern clothing, shoes and bags for men, women and kids. Free tailoring on suits bought in store.',
 TRUE, 'Somalia', 'Mogadishu', 'Xamar Weyne', '/seed/family-outfits.png', NULL, 'approved'),
(3, 2, 'bakaaro.home@dalab.test', '$2b$10$2ps.RC6I0Mpvgm2o72hYEuHaoeFdaPVUFnsMlX65CyoQER0BocTDC', 'Bakaaro Home & Kitchen',
 'Appliances, cookware and solar power for Somali homes. Delivery and installation across Mogadishu.',
 TRUE, 'Somalia', 'Mogadishu', 'Hawl Wadaag', '/seed/home-appliances.png', NULL, 'approved'),
(4, 3, 'lido.beauty@dalab.test', '$2b$10$2ps.RC6I0Mpvgm2o72hYEuHaoeFdaPVUFnsMlX65CyoQER0BocTDC', 'Lido Beauty',
 'Original skincare and make-up chosen for our warm climate. Gift boxes for Eid and weddings.',
 TRUE, 'Somalia', 'Mogadishu', 'Abdiaziz', '/seed/skincare-set.jpg', NULL, 'approved');

INSERT INTO Categories (id, name, image_url) VALUES
(1, 'Electronics', '/seed/tech-bundle.png'),
(2, 'Phones & Accessories', '/seed/smartphone.svg'),
(3, 'Fashion', '/seed/family-outfits.png'),
(4, 'Home & Kitchen', '/seed/home-appliances.png'),
(5, 'Beauty', '/seed/skincare-set.jpg'),
(6, 'Sports', '/seed/football.svg');

INSERT INTO Products (id, vendor_id, category_id, name, price, description, image_urls, isFeatured, stock) VALUES
-- Hodan Electronics
(1, 1, 1, 'StudyPro 14" Laptop — Core i5, 8GB, 512GB SSD', 520.00,
 'A light 14-inch laptop built for university and office work. Fast 512GB SSD, 8GB RAM and a battery that lasts through long study days and power cuts. Includes charger, laptop sleeve and 6-month Hodan Electronics warranty.',
 '["/seed/tech-bundle.png"]', TRUE, 9),
(2, 1, 1, 'BassWave Wireless Headphones (ANC)', 59.00,
 'Over-ear Bluetooth headphones with active noise cancelling — perfect for the busy bus ride or studying at home. Up to 35 hours of playtime and a built-in mic for clear calls.',
 '["/seed/headphones.svg"]', FALSE, 25),
(3, 1, 1, 'FitPulse Smartwatch', 34.00,
 'Water-resistant smartwatch with step counter, heart-rate and sleep tracking, plus call and WhatsApp notifications. Works with Android and iPhone; 7-day battery.',
 '["/seed/smartwatch.svg"]', FALSE, 40),
(4, 1, 2, 'Nova X6 Smartphone — 128GB, Dual SIM', 159.00,
 '6.6-inch display, 128GB storage, 50MP camera and a 5,000 mAh battery. Dual SIM for Hormuud and Somtel. We activate your SIM and EVC Plus for free in store.',
 '["/seed/smartphone.svg"]', TRUE, 30),
(5, 1, 2, 'Nova Lite Smartphone — 64GB', 95.00,
 'An easy, reliable everyday phone with a big battery, dual SIM and a sharp 6.5-inch screen. A great first phone for students and parents.',
 '["/seed/smartphone.svg"]', FALSE, 45),
(6, 1, 2, 'PowerGo 20,000 mAh Power Bank', 21.00,
 'Charge your phone up to five times when the electricity is out. Fast-charging USB-C and two USB ports, with a battery-level display.',
 '["/seed/powerbank.svg"]', TRUE, 70),
(7, 1, 2, 'AirTune Wireless Earbuds', 26.00,
 'True wireless earbuds with a pocket charging case, touch controls and 24 hours of total playtime. Sweat-resistant for walks along Lido beach.',
 '["/seed/earbuds.svg"]', FALSE, 55),
-- Xamar Fashion House
(8, 2, 3, 'Classic Wedding Suit — Black, 2 Pieces', 125.00,
 'Slim-fit black suit with jacket and trousers in a breathable fabric made for warm evenings. Free tailoring in our Xamar Weyne shop.',
 '["/seed/mens-suit.png"]', TRUE, 14),
(9, 2, 3, 'Women''s Tailored Office Blazer', 44.00,
 'A sharp, softly lined blazer that layers beautifully over an abaya, dress or trousers. Ideal for the office, university and events.',
 '["/seed/womens-blazer.png"]', FALSE, 20),
(10, 2, 3, 'Family Holiday Outfits (Set of 4)', 68.00,
 'Matching light-cotton outfits for the whole family — a shirt for dad, a dress for mum and sets for two children. Made for Eid photos and beach days.',
 '["/seed/family-outfits.png"]', FALSE, 8),
(11, 2, 3, 'Urban Laptop Backpack with USB Port', 23.00,
 'Water-resistant black backpack with a padded 15.6-inch laptop pocket, USB charging port and anti-theft back pocket.',
 '["/seed/black-backpack.png"]', FALSE, 50),
(12, 2, 6, 'CloudStep White Sneakers', 46.00,
 'Clean all-white sneakers with a cushioned sole for all-day comfort. Easy to match with jeans, khamiis or sportswear. Sizes 39–45.',
 '["/seed/white-sneakers.png"]', TRUE, 36),
(13, 2, 6, 'Match Football — Size 5', 17.00,
 'Durable stitched football for the pitch, the street or the beach. Holds its shape and air for months of play.',
 '["/seed/football.svg"]', FALSE, 60),
-- Bakaaro Home & Kitchen
(14, 3, 4, 'CoolKeep Inverter Fridge — 420L', 575.00,
 'Large double-door fridge with an energy-saving inverter compressor that keeps food cool longer during power cuts. Free delivery and installation in Mogadishu.',
 '["/seed/home-appliances.png"]', TRUE, 6),
(15, 3, 4, 'Bakaaro Non-Stick Cookware Set (7 pieces)', 52.00,
 'Pots, a frying pan and lids with a durable non-stick coating — ideal for bariis, suqaar and sabaayad. Works on gas and electric stoves.',
 '["/seed/cookware.svg"]', FALSE, 18),
(16, 3, 4, 'SteelBoil Electric Kettle 1.8L', 18.00,
 'Fast-boiling stainless-steel kettle for shaah and coffee, with automatic shut-off and a 360° base.',
 '["/seed/kettle.svg"]', FALSE, 40),
(17, 3, 4, 'SunHome Solar Light & Charging Kit', 39.00,
 'A solar panel with a bright LED lamp and USB charging for phones — reliable light and power for your home, even off-grid.',
 '["/seed/solar-kit.svg"]', TRUE, 24),
-- Lido Beauty
(18, 4, 5, 'Max Factor Facefinity 3-in-1 Foundation, SPF 20', 19.00,
 'Primer, concealer and foundation in one bottle, with SPF 20. Light, long-lasting coverage that holds up in Mogadishu heat. 30ml.',
 '["/seed/foundation-1.jpg", "/seed/foundation-2.jpg", "/seed/foundation-3.jpg"]', TRUE, 35),
(19, 4, 5, 'Anua Heartleaf 77% Soothing Toner, 250ml', 24.00,
 'A gentle Korean toner that calms redness and hydrates sensitive skin. Alcohol-free and suitable for daily use morning and night.',
 '["/seed/toner.webp"]', FALSE, 22),
(20, 4, 5, 'Bridal Glow Skincare Box', 58.00,
 'Cleanser, face oil, drying lotion, overnight mask and gel-cream moisturiser in one gift box — the perfect present for a bride or for Eid.',
 '["/seed/skincare-set.jpg"]', TRUE, 12);

INSERT INTO Reviews (product_id, customer_id, rating, comment) VALUES
(1, 4, 5, 'Fast laptop and the battery really lasts during power cuts. Delivered the same day to Hodan.'),
(1, 5, 4, 'Good value. The charger cable could be longer.'),
(4, 5, 5, 'They activated my SIM and EVC Plus in five minutes. Great phone for the price.'),
(4, 4, 4, 'Camera is very good in daylight, a bit weak at night.'),
(6, 4, 5, 'Charged my phone four times when the electricity was off. Waa fiican yahay!'),
(8, 5, 5, 'Wore it to my brother''s wedding — the free tailoring made it fit perfectly.'),
(12, 4, 4, 'Comfortable and the size was correct. They get dirty quickly because they are white.'),
(14, 5, 5, 'Installed the same day. Food stayed cold through a long power cut.'),
(18, 4, 5, 'Same shade as in the shop and it stays on the whole day, even in the heat.'),
(20, 5, 5, 'Bought it for my sister''s wedding — she loved it. Beautiful packaging.');
