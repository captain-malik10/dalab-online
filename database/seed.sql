-- Ashal Online Market — demo data (matches database/schema.sql)
-- Demo logins (passwords are stored as bcrypt hashes, generated with scripts/hash-passwords.js):
--   Admin:     admin@ashal.so       / Admin@123
--   Vendors:   bakaara@ashal.so     / Vendor@123   (store login + customer login)
--              hodan@ashal.so       / Vendor@123
--   Customers: customer@ashal.so    / Customer@123
--              amina@ashal.so       / Customer@123

INSERT INTO Users (id, name, email, password, phone, role) VALUES
(1, 'Ashal Admin', 'admin@ashal.so', '$2b$10$vAMi6rVg4t1MhQB9jFfqOeljr1X1/gKe5zP0SXneev28QuGJLmoTi', '+252610000001', 'admin'),
(2, 'Abdirahman Warsame', 'bakaara@ashal.so', '$2b$10$8CHWvu2wWBd8rRZg9Y1DbekcQxdVYqLJYs7VjFowHr6yl1SlRBsnG', '+252615550102', 'vendor'),
(3, 'Hodan Ali', 'hodan@ashal.so', '$2b$10$8CHWvu2wWBd8rRZg9Y1DbekcQxdVYqLJYs7VjFowHr6yl1SlRBsnG', '+252615550103', 'vendor'),
(4, 'Mohamed Hassan', 'customer@ashal.so', '$2b$10$TGTfxhpSITd3.9K.YiX.S.RslSV4VsVnMVSCoB2fMV2NNwAEP39Dq', '+252615550104', 'customer'),
(5, 'Amina Yusuf', 'amina@ashal.so', '$2b$10$TGTfxhpSITd3.9K.YiX.S.RslSV4VsVnMVSCoB2fMV2NNwAEP39Dq', '+252625550105', 'customer');

INSERT INTO Vendors (id, user_id, email, password, store_name, description, isVerified, country, city, district, logo_url, license_url, status) VALUES
(1, 2, 'bakaara@ashal.so', '$2b$10$8CHWvu2wWBd8rRZg9Y1DbekcQxdVYqLJYs7VjFowHr6yl1SlRBsnG', 'Bakaara Tech & Home',
 'Electronics, home appliances, bags and footwear from Bakaara Market. Genuine products, delivery across Mogadishu.',
 TRUE, 'Somalia', 'Mogadishu', 'Hawl Wadaag', '/seed/tech-bundle.png', NULL, 'approved'),
(2, 3, 'hodan@ashal.so', '$2b$10$8CHWvu2wWBd8rRZg9Y1DbekcQxdVYqLJYs7VjFowHr6yl1SlRBsnG', 'Hodan Beauty & Fashion',
 'Original skincare, make-up and modern clothing for women, men and families.',
 TRUE, 'Somalia', 'Mogadishu', 'Hodan', '/seed/skincare-set.jpg', NULL, 'approved');

INSERT INTO Categories (id, name, image_url) VALUES
(1, 'Electronics', '/seed/tech-bundle.png'),
(2, 'Fashion', '/seed/family-outfits.png'),
(3, 'Beauty & Skincare', '/seed/skincare-set.jpg'),
(4, 'Home & Appliances', '/seed/home-appliances.png'),
(5, 'Shoes & Sports', '/seed/white-sneakers.png'),
(6, 'Bags & Travel', '/seed/pink-backpack.png');

INSERT INTO Products (id, vendor_id, category_id, name, price, description, image_urls, isFeatured, stock) VALUES
-- Bakaara Tech & Home
(1, 1, 1, '13-inch Ultrabook Laptop (8GB RAM, 256GB SSD)', 650.00,
 'Thin and light 13-inch laptop for students and office work. 8GB RAM, fast 256GB SSD, full-day battery and backlit keyboard. Comes with charger and 6-month shop warranty.',
 '["/seed/tech-bundle.png"]', TRUE, 12),
(2, 1, 1, 'Wireless Noise-Cancelling Headphones', 85.00,
 'Over-ear Bluetooth headphones with active noise cancelling, soft memory-foam cushions and up to 30 hours of battery. Great for travel, study and calls.',
 '["/seed/tech-bundle.png"]', FALSE, 30),
(3, 1, 1, 'Smartwatch with Fitness Tracking', 45.00,
 'Water-resistant smartwatch with heart-rate monitor, step counter, sleep tracking and call/message notifications. Works with Android and iPhone.',
 '["/seed/tech-bundle.png"]', FALSE, 40),
(4, 1, 4, 'Double-Door Refrigerator 450L', 620.00,
 'Large frost-free double-door fridge with energy-saving inverter compressor, ideal for family homes. Stays cool longer during power cuts. Free delivery in Mogadishu.',
 '["/seed/home-appliances.png"]', TRUE, 6),
(5, 1, 4, 'Front-Load Washing Machine 8kg', 390.00,
 '8kg automatic washing machine with 15 wash programs, quick-wash mode and low water use. Gentle on clothes, strong on dirt.',
 '["/seed/home-appliances.png"]', FALSE, 8),
(6, 1, 5, 'Classic White Leather Sneakers', 55.00,
 'Clean all-white low-top sneakers with cushioned sole. Easy to match with jeans, khamiis or sportswear. Sizes 39 to 45.',
 '["/seed/white-sneakers.png"]', TRUE, 50),
(7, 1, 6, 'Laptop Backpack with USB Charging Port', 25.00,
 'Water-resistant black backpack with padded 15.6-inch laptop pocket, built-in USB charging port and anti-theft back pocket. Perfect for university and work.',
 '["/seed/black-backpack.png"]', FALSE, 60),
(8, 1, 6, 'Women''s Travel Backpack – Blush Pink', 32.00,
 'Stylish pink travel backpack with many compartments, laptop sleeve, USB port and gold zippers. Light, strong and comfortable for daily use.',
 '["/seed/pink-backpack.png"]', FALSE, 35),
(9, 1, 6, 'Kids School Backpack – Sunny Yellow', 15.00,
 'Bright, durable school bag for children aged 5 to 12, with padded straps and space for books and a lunch box.',
 '["/seed/kids-backpacks.png"]', FALSE, 80),
-- Hodan Beauty & Fashion
(10, 2, 3, 'Max Factor Facefinity 3-in-1 Foundation SPF 20', 18.00,
 'Primer, concealer and foundation in one bottle with SPF 20. Light, long-lasting coverage that suits warm climates. 30ml, several shades available.',
 '["/seed/foundation-1.jpg", "/seed/foundation-2.jpg", "/seed/foundation-3.jpg"]', TRUE, 45),
(11, 2, 3, 'Anua Heartleaf 77% Soothing Toner 250ml', 22.00,
 'Gentle Korean toner with 77% heartleaf extract that calms redness and hydrates sensitive skin. Alcohol-free, suitable for daily use.',
 '["/seed/toner.webp"]', FALSE, 25),
(12, 2, 3, 'The Ordinary Skincare Essentials Set (4 pieces)', 38.00,
 'Four best-sellers: mineral sunscreen SPF 30, hydrating moisturizer, salicylic acid 2% for acne-prone skin and multi-peptide hair serum.',
 '["/seed/ordinary-set.webp"]', TRUE, 20),
(13, 2, 3, 'Glow Skincare Gift Box', 55.00,
 'A complete glow routine in one box: foaming cleanser, face oil, drying lotion, overnight mask and gel-cream moisturizer. A perfect gift for Eid or weddings.',
 '["/seed/skincare-set.jpg"]', FALSE, 15),
(14, 2, 2, 'Men''s Slim-Fit Black Suit (2 pieces)', 110.00,
 'Elegant slim-fit black suit with jacket and trousers, made from breathable fabric. Ideal for weddings, graduations and office.',
 '["/seed/mens-suit.png"]', TRUE, 18),
(15, 2, 2, 'Women''s Tailored Black Blazer', 42.00,
 'Modern tailored blazer with a soft lining. Looks smart over an abaya, dress or trousers for work and events.',
 '["/seed/womens-blazer.png"]', FALSE, 22),
(16, 2, 2, 'Family Matching Summer Outfit Set', 60.00,
 'Matching floral summer outfits for the whole family: shirt for dad, dress for mum and sets for two kids. Light cotton, perfect for photos and holidays.',
 '["/seed/family-outfits.png"]', FALSE, 10);

INSERT INTO Reviews (product_id, customer_id, rating, comment) VALUES
(1, 4, 5, 'Fast laptop, battery lasts all day at university. Delivered in two days.'),
(1, 5, 4, 'Good value for the price. The charger is a bit short.'),
(6, 4, 5, 'Very comfortable and the size was correct.'),
(10, 5, 5, 'Same shade as in the shop, stays on the whole day even in the heat.'),
(10, 4, 4, 'Bought as a gift for my sister, she liked it.'),
(12, 5, 4, 'Original products. The sunscreen leaves a little white cast.'),
(14, 4, 5, 'Wore it to my brother''s wedding, fits perfectly.');
