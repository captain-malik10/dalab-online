-- Dummy data for Products table

-- 8 Products for Vendor 1 (Tech Trove)
INSERT INTO Products (id, vendor_id, category_id, name, price, stock, description, image_url, isFeatured, discount) VALUES
(1, 1, 1, 'Laptop Pro', 1200.00, 50, 'High-performance laptop for professionals.', 'http://example.com/prod1.png', TRUE, 100.00),
(2, 1, 1, 'Smartphone X', 800.00, 150, 'Latest model with stunning camera.', 'http://example.com/prod2.png', TRUE, 50.00),
(3, 1, 1, 'Wireless Headphones', 150.00, 300, 'Noise-cancelling over-ear headphones.', 'http://example.com/prod3.png', FALSE, 0),
(4, 1, 1, 'Smartwatch 2', 250.00, 100, 'Track your fitness and notifications.', 'http://example.com/prod4.png', FALSE, 0),
(5, 1, 4, 'Smart Home Hub', 100.00, 200, 'Control your smart home devices.', 'http://example.com/prod5.png', TRUE, 10.00),
(6, 1, 4, 'LED Smart Bulb', 20.00, 500, 'Color-changing smart bulb.', 'http://example.com/prod6.png', FALSE, 0),
(7, 1, 1, '4K Monitor', 400.00, 80, '27-inch 4K UHD Monitor.', 'http://example.com/prod7.png', FALSE, 0),
(8, 1, 1, 'Mechanical Keyboard', 120.00, 120, 'RGB mechanical gaming keyboard.', 'http://example.com/prod8.png', FALSE, 0);

-- 8 Products for Vendor 2 (Fashion Forward)
INSERT INTO Products (id, vendor_id, category_id, name, price, stock, description, image_url, isFeatured, discount) VALUES
(9, 2, 2, 'Summer Dress', 60.00, 200, 'Light and airy dress for summer.', 'http://example.com/prod9.png', TRUE, 5.00),
(10, 2, 2, 'Denim Jeans', 75.00, 250, 'Classic straight-fit denim jeans.', 'http://example.com/prod10.png', FALSE, 0),
(11, 2, 2, 'Leather Jacket', 250.00, 100, 'Timeless black leather jacket.', 'http://example.com/prod11.png', TRUE, 25.00),
(12, 2, 2, 'Running Shoes', 120.00, 180, 'Comfortable and stylish running shoes.', 'http://example.com/prod12.png', FALSE, 0),
(13, 2, 2, 'Graphic T-Shirt', 25.00, 400, '100% cotton graphic print t-shirt.', 'http://example.com/prod13.png', FALSE, 0),
(14, 2, 2, 'Winter Coat', 180.00, 90, 'Warm and waterproof winter coat.', 'http://example.com/prod14.png', FALSE, 0),
(15, 2, 2, 'Sunglasses', 80.00, 150, 'UV protection stylish sunglasses.', 'http://example.com/prod15.png', FALSE, 0),
(16, 2, 2, 'Beanie Hat', 20.00, 300, 'Wool beanie for cold weather.', 'http://example.com/prod16.png', FALSE, 0);

-- 8 Products for Vendor 3 (Book Nook)
INSERT INTO Products (id, vendor_id, category_id, name, price, stock, description, image_url, isFeatured, discount) VALUES
(17, 3, 3, 'The Last Adventure', 15.99, 100, 'A thrilling fantasy novel.', 'http://example.com/prod17.png', TRUE, 2.00),
(18, 3, 3, 'Cooking for Beginners', 24.99, 80, 'Easy recipes for new cooks.', 'http://example.com/prod18.png', FALSE, 0),
(19, 3, 3, 'A History of Time', 19.99, 120, 'The universe explained.', 'http://example.com/prod19.png', FALSE, 0),
(20, 3, 3, 'The Art of Drawing', 29.99, 60, 'Learn to draw in 30 days.', 'http://example.com/prod20.png', FALSE, 0),
(21, 3, 3, 'Mystery on the Orient Express', 14.99, 150, 'A classic whodunit.', 'http://example.com/prod21.png', FALSE, 0),
(22, 3, 3, 'Gardening 101', 18.99, 90, 'A guide to starting your own garden.', 'http://example.com/prod22.png', FALSE, 0),
(23, 3, 3, 'The Sci-Fi Collection', 45.99, 50, 'A collection of 5 classic sci-fi novels.', 'http://example.com/prod23.png', TRUE, 5.00),
(24, 3, 3, 'Poetry for the Soul', 12.99, 200, 'A collection of modern poetry.', 'http://example.com/prod24.png', FALSE, 0);
