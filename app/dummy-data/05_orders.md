-- Dummy data for Orders table
-- 4 orders for each of the 10 customers (40 total)

INSERT INTO Orders (id, customer_id, total, status, payment_status) VALUES
-- Customer 5 (Alpha)
(1, 5, 1350.00, 'completed', 'paid'),
(2, 5, 175.00, 'pending', 'pending'),
(3, 5, 400.00, 'cancelled', 'failed'),
(4, 5, 120.00, 'completed', 'paid'),
-- Customer 6 (Bravo)
(5, 6, 800.00, 'completed', 'paid'),
(6, 6, 60.00, 'processing', 'paid'),
(7, 6, 250.00, 'completed', 'paid'),
(8, 6, 15.99, 'pending', 'pending'),
-- Customer 7 (Charlie)
(9, 7, 120.00, 'completed', 'paid'),
(10, 7, 25.00, 'completed', 'paid'),
(11, 7, 180.00, 'cancelled', 'pending'),
(12, 7, 45.99, 'processing', 'paid'),
-- Customer 8 (Delta)
(13, 8, 15.99, 'completed', 'paid'),
(14, 8, 24.99, 'completed', 'paid'),
(15, 8, 19.99, 'completed', 'paid'),
(16, 8, 29.99, 'pending', 'pending'),
-- Customer 9 (Echo)
(17, 9, 14.99, 'completed', 'paid'),
(18, 9, 18.99, 'completed', 'paid'),
(19, 9, 45.99, 'completed', 'paid'),
(20, 9, 12.99, 'completed', 'paid'),
-- Customer 10 (Foxtrot)
(21, 10, 1200.00, 'processing', 'paid'),
(22, 10, 800.00, 'completed', 'paid'),
(23, 10, 150.00, 'completed', 'paid'),
(24, 10, 250.00, 'pending', 'pending'),
-- Customer 11 (Golf)
(25, 11, 100.00, 'completed', 'paid'),
(26, 11, 20.00, 'completed', 'paid'),
(27, 11, 400.00, 'cancelled', 'failed'),
(28, 11, 120.00, 'completed', 'paid'),
-- Customer 12 (Hotel)
(29, 12, 60.00, 'completed', 'paid'),
(30, 12, 75.00, 'processing', 'paid'),
(31, 12, 250.00, 'completed', 'paid'),
(32, 12, 120.00, 'pending', 'pending'),
-- Customer 13 (India)
(33, 13, 25.00, 'completed', 'paid'),
(34, 13, 180.00, 'completed', 'paid'),
(35, 13, 80.00, 'cancelled', 'pending'),
(36, 13, 20.00, 'processing', 'paid'),
-- Customer 14 (Juliet)
(37, 14, 15.99, 'completed', 'paid'),
(38, 14, 24.99, 'completed', 'paid'),
(39, 14, 19.99, 'completed', 'paid'),
(40, 14, 29.99, 'pending', 'pending');
