-- Dummy data for Users table

-- 1 Admin
INSERT INTO Users (id, name, email, password, phone, role) VALUES
(1, 'Admin User', 'admin@example.com', 'hashed_password', '123-456-7890', 'admin');

-- 3 Vendors/Store Owners
INSERT INTO Users (id, name, email, password, phone, role) VALUES
(2, 'Vendor One', 'vendor1@example.com', 'hashed_password', '234-567-8901', 'vendor'),
(3, 'Vendor Two', 'vendor2@example.com', 'hashed_password', '345-678-9012', 'vendor'),
(4, 'Vendor Three', 'vendor3@example.com', 'hashed_password', '456-789-0123', 'vendor');

-- 10 Customers
INSERT INTO Users (id, name, email, password, phone, role) VALUES
(5, 'Customer Alpha', 'alpha@example.com', 'hashed_password', '567-890-1234', 'customer'),
(6, 'Customer Bravo', 'bravo@example.com', 'hashed_password', '678-901-2345', 'customer'),
(7, 'Customer Charlie', 'charlie@example.com', 'hashed_password', '789-012-3456', 'customer'),
(8, 'Customer Delta', 'delta@example.com', 'hashed_password', '890-123-4567', 'customer'),
(9, 'Customer Echo', 'echo@example.com', 'hashed_password', '901-234-5678', 'customer'),
(10, 'Customer Foxtrot', 'foxtrot@example.com', 'hashed_password', '012-345-6789', 'customer'),
(11, 'Customer Golf', 'golf@example.com', 'hashed_password', '112-233-4455', 'customer'),
(12, 'Customer Hotel', 'hotel@example.com', 'hashed_password', '223-344-5566', 'customer'),
(13, 'Customer India', 'india@example.com', 'hashed_password', '334-455-6677', 'customer'),
(14, 'Customer Juliet', 'juliet@example.com', 'hashed_password', '445-566-7788', 'customer');
