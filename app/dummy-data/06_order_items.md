-- Dummy data for Order_Items table

INSERT INTO Order_Items (order_id, product_id, quantity, price) VALUES
-- Order 1 (Customer 5)
(1, 1, 1, 1200.00),
(1, 3, 1, 150.00),
-- Order 2 (Customer 5)
(2, 4, 1, 250.00),
-- Order 3 (Customer 5) - Cancelled, but items might still be recorded
(3, 7, 1, 400.00),
-- Order 4 (Customer 5)
(4, 8, 1, 120.00),

-- Order 5 (Customer 6)
(5, 2, 1, 800.00),
-- Order 6 (Customer 6)
(6, 9, 1, 60.00),
-- Order 7 (Customer 6)
(7, 11, 1, 250.00),
-- Order 8 (Customer 6)
(8, 17, 1, 15.99),

-- Order 9 (Customer 7)
(9, 12, 1, 120.00),
-- Order 10 (Customer 7)
(10, 13, 1, 25.00),
-- Order 11 (Customer 7)
(11, 14, 1, 180.00),
-- Order 12 (Customer 7)
(12, 23, 1, 45.99),

-- Orders 13-16 (Customer 8)
(13, 17, 1, 15.99),
(14, 18, 1, 24.99),
(15, 19, 1, 19.99),
(16, 20, 1, 29.99),

-- Orders 17-20 (Customer 9)
(17, 21, 1, 14.99),
(18, 22, 1, 18.99),
(19, 23, 1, 45.99),
(20, 24, 1, 12.99),

-- Orders 21-24 (Customer 10)
(21, 1, 1, 1200.00),
(22, 2, 1, 800.00),
(23, 3, 1, 150.00),
(24, 4, 1, 250.00),

-- Orders 25-28 (Customer 11)
(25, 5, 1, 100.00),
(26, 6, 2, 20.00),
(27, 7, 1, 400.00),
(28, 8, 1, 120.00),

-- Orders 29-32 (Customer 12)
(29, 9, 1, 60.00),
(30, 10, 1, 75.00),
(31, 11, 1, 250.00),
(32, 12, 1, 120.00),

-- Orders 33-36 (Customer 13)
(33, 13, 1, 25.00),
(34, 14, 1, 180.00),
(35, 15, 1, 80.00),
(36, 16, 1, 20.00),

-- Orders 37-40 (Customer 14)
(37, 17, 1, 15.99),
(38, 18, 1, 24.99),
(39, 19, 1, 19.99),
(40, 20, 1, 29.99);
