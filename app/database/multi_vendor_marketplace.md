# Dalab Online

## 1. Project Introduction

Dalab Online is a web-based Multi-Vendor E-Commerce Marketplace platform that allows multiple vendors to sell their products through a single online storefront. Customers can browse products from various vendors, place orders, and make payments, while vendors manage their own product listings, inventory, and sales. The platform also includes an admin panel for overseeing vendors, orders, and analytics.

This project is designed to provide a real-world, medium-to-pro level application, incorporating authentication, role-based access, payment integration, and advanced features like notifications and commission tracking.

---

## 2. Requirements

### Core Requirements

**Authentication & Authorization**

- User roles: Admin, Vendor, Customer
- JWT-based authentication
- Role-based access control (RBAC)

**Vendor Features**

- Vendor profile setup (store name, logo, description)
- Product management (CRUD)
- Inventory management (stock levels)
- Order management (view, accept, fulfill orders)
- Sales dashboard (revenue, orders, top-selling products)

**Customer Features**

- Browse products by vendor/category
- Search and filter products (price, rating, category)
- Shopping cart & checkout flow
- Wishlist / favorites
- Order history & tracking
- Product reviews and ratings

**Admin Features**

- Manage vendors (approve/reject vendor accounts)
- Manage categories & global settings
- Monitor sales, commissions, and payouts
- Analytics dashboard (total sales, vendors, customers)
- Handle disputes/refunds

### Advanced Features

- Payment Integration (Stripe, PayPal) with vendor revenue split
- Commission system (admin takes % from vendor sales)
- Email/Notification system (order confirmations, vendor alerts)
- Multi-language & multi-currency support
- Product image uploads (Cloudinary/S3)

---

## 3. Tech Stack

- **Frontend:** React, TailwindCSS, Redux/Zustand (state management)
- **Backend:** Node.js, Express.js, JWT authentication
- **Database:** MySQL
- **Payment Gateway:** Stripe or PayPal
- **File Storage:** Cloudinary or AWS S3
- **Notifications:** Nodemailer / Push Notifications

---

## 4. Assets

**Color Palette**

- Primary: #1F2937 (Dark Gray) / Dark Theme: #111827
- Secondary: #3B82F6 (Blue) / Dark Theme: #2563EB
- Accent: #FBBF24 (Amber) / Dark Theme: #F59E0B
- Background: #F9FAFB (Light Gray) / Dark Theme: #1E293B
- Text: #111827 (Dark Text) / Dark Theme: #F8FAFC

**Icon Library**

- [Heroicons](https://heroicons.com/)
- [Font Awesome](https://fontawesome.com/)
- Optional: React Icons

---

## 5. Database Schema (SQL Commands)

```sql
-- Users Table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','vendor','customer') NOT NULL
);

-- Vendors Table
CREATE TABLE Vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Categories Table
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

-- Products Table
CREATE TABLE Products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

-- Orders Table
CREATE TABLE Orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
    payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES Users(id)
);

-- Order_Items Table
CREATE TABLE Order_Items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Reviews Table
CREATE TABLE Reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (customer_id) REFERENCES Users(id)
);

-- Payments Table
CREATE TABLE Payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('stripe','paypal') NOT NULL,
    status ENUM('pending','completed','failed') DEFAULT 'pending',
    FOREIGN KEY (order_id) REFERENCES Orders(id)
);
```
