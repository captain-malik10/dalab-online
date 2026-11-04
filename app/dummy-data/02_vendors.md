-- Dummy data for Vendors table

INSERT INTO Vendors (id, user_id, store_name, description, isVerified, location, logo_url, license_url, status) VALUES
(1, 2, 'Tech Trove', 'The latest and greatest in tech gadgets.', TRUE, 'Silicon Valley, CA', 'http://example.com/logo1.png', 'http://example.com/license1.pdf', 'approved'),
(2, 3, 'Fashion Forward', 'Trendy apparel for all seasons.', TRUE, 'New York, NY', 'http://example.com/logo2.png', 'http://example.com/license2.pdf', 'approved'),
(3, 4, 'Book Nook', 'A cozy corner for book lovers.', FALSE, 'Portland, OR', 'http://example.com/logo3.png', 'http://example.com/license3.pdf', 'pending');
