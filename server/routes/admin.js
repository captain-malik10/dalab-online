import express from 'express';
import db from '../config/db.js';
import authenticateToken from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

router.use(authenticateToken, isAdmin);

router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, role FROM Users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id: userId } = req.params;
  const { name, email, phone, role } = req.body;

  if (!name && !email && !phone && !role) {
    return res.status(400).json({ error: 'No fields to update provided.' });
  }

  const fieldsToUpdate = [];
  const values = [];

  if (name) {
    fieldsToUpdate.push('name = ?');
    values.push(name);
  }
  if (email) {
    fieldsToUpdate.push('email = ?');
    values.push(email);
  }
  if (phone) {
    fieldsToUpdate.push('phone = ?');
    values.push(phone);
  }
  if (role) {
    fieldsToUpdate.push('role = ?');
    values.push(role);
  }

  values.push(userId);

  const sql = `UPDATE Users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error(`Error updating user ${userId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id: userId } = req.params;

  try {
    const [result] = await db.query('DELETE FROM Users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(`Error deleting user ${userId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.id AS order_id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone
      FROM Orders o
      JOIN Users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `);

    const formattedOrders = orders.map((order) => ({
      id: order.order_id,
      total: order.total,
      status: order.status,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: {
        id: order.customer_id,
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
    }));

    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders/:id', async (req, res) => {
  const { id: orderId } = req.params;
  try {
    // Fetch main order + customer info
    const [orderRows] = await db.query(
      `
      SELECT 
        o.id AS order_id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone
      FROM Orders o
      JOIN Users u ON o.customer_id = u.id
      WHERE o.id = ?
    `,
      [orderId],
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const orderData = orderRows[0];

    // Fetch order items + product + vendor info
    const [items] = await db.query(
      `
      SELECT 
        oi.id AS item_id,
        oi.product_id,
        oi.quantity,
        oi.price AS item_price,
        p.name AS product_name,
        p.description AS product_description,
        p.image_urls,
        v.id AS vendor_id,
        v.store_name,
        v.email AS vendor_email,
        v.isVerified,
        v.country,
        v.city,
        v.logo_url,
        v.status AS vendor_status
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.id
      JOIN Vendors v ON p.vendor_id = v.id
      WHERE oi.order_id = ?
    `,
      [orderId],
    );

    // Build store info (from first item)
    const store = items.length
      ? {
          id: items[0].vendor_id,
          store_name: items[0].store_name,
          email: items[0].vendor_email,
          isVerified: !!items[0].isVerified,
          country: items[0].country,
          city: items[0].city,
          logo_url: items[0].logo_url,
          status: items[0].vendor_status,
        }
      : null;

    // Format items and handle image_urls safely
    const formattedItems = items.map((i) => {
      let imageUrls = [];

      // Check if MySQL returned an array or string
      if (Array.isArray(i.image_urls)) {
        imageUrls = i.image_urls;
      } else if (typeof i.image_urls === 'string') {
        try {
          imageUrls = JSON.parse(i.image_urls);
        } catch (error) {
          console.error(
            `Failed to parse image_urls for product ${i.product_id}:`,
            i.image_urls,
            error,
          );
        }
      }

      return {
        id: i.item_id,
        product_id: i.product_id,
        name: i.product_name,
        description: i.product_description,
        quantity: i.quantity,
        price: i.item_price,
        image_urls: imageUrls,
      };
    });

    const [deliveryRows] = await db.query('SELECT * FROM Deliveries WHERE order_id = ?', [orderId]);
    const delivery = deliveryRows.length > 0 ? deliveryRows[0] : null;

    res.json({
      order: {
        id: orderData.order_id,
        total: orderData.total,
        status: orderData.status,
        payment_status: orderData.payment_status,
        shipping_address: orderData.shipping_address,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
      },
      customer: {
        id: orderData.customer_id,
        name: orderData.customer_name,
        email: orderData.customer_email,
        phone: orderData.customer_phone,
      },
      store,
      items: formattedItems,
      delivery,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/orders/:id/approve', async (req, res) => {
  const { id: orderId } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update Order and Payment status
    await connection.query(
      `UPDATE Orders SET status = 'processing', payment_status = 'paid' WHERE id = ?`,
      [orderId],
    );
    await connection.query(`UPDATE Payments SET status = 'completed' WHERE order_id = ?`, [
      orderId,
    ]);

    // 2. Get all items for the order
    const [items] = await connection.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.vendor_id
       FROM Order_Items oi
       JOIN Products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId],
    );

    if (items.length === 0) {
      throw new Error('No order items found.');
    }

    // 3. Group items by vendor and calculate their totals
    const vendorTotals = items.reduce((acc, item) => {
      const { vendor_id, price, quantity } = item;
      if (!acc[vendor_id]) {
        acc[vendor_id] = 0;
      }
      acc[vendor_id] += price * quantity;
      return acc;
    }, {});

    // 4. Create a separate payout for each vendor
    for (const vendorId in vendorTotals) {
      const vendorTotal = vendorTotals[vendorId];
      const payoutAmount = vendorTotal * 0.9; // Apply 10% commission

      await connection.query(
        `INSERT INTO Payouts (vendor_id, order_id, amount, status)
         VALUES (?, ?, ?, 'completed')`,
        [vendorId, orderId, payoutAmount],
      );
    }

    // 5. Update stock for all products in the order
    for (const item of items) {
      await connection.query('UPDATE Products SET stock = stock - ? WHERE id = ?', [
        item.quantity,
        item.product_id,
      ]);
    }

    await connection.commit();
    res.json({
      message: `Order ${orderId} approved, payouts processed for ${Object.keys(vendorTotals).length} vendors.`,
    });
  } catch (err) {
    await connection.rollback();
    console.error(`Error approving order ${orderId}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

router.put('/orders/:id/deny', async (req, res) => {
  const { id: orderId } = req.params;
  try {
    await db.query("UPDATE Orders SET status = 'denied' WHERE id = ?", [orderId]);
    await db.query("UPDATE Payments SET status = 'failed' WHERE order_id = ?", [orderId]);
    res.json({ message: `Order ${orderId} has been denied.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/orders/:id/assign-delivery', async (req, res) => {
  const { id: orderId } = req.params;
  const { tracking_number } = req.body;

  if (!tracking_number) {
    return res.status(400).json({ error: 'tracking_number is required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [deliveryRows] = await connection.query('SELECT id FROM Deliveries WHERE order_id = ?', [
      orderId,
    ]);

    if (deliveryRows.length > 0) {
      // Update existing delivery
      await connection.query('UPDATE Deliveries SET tracking_number = ? WHERE order_id = ?', [
        tracking_number,
        orderId,
      ]);
    } else {
      // Insert new delivery
      const [orderRows] = await connection.query(
        'SELECT shipping_address FROM Orders WHERE id = ?',
        [orderId],
      );

      if (orderRows.length === 0) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      const shipping_address = orderRows[0].shipping_address;

      await connection.query(
        'INSERT INTO Deliveries (order_id, tracking_number, status, delivery_address) VALUES (?, ?, ?, ?)',
        [orderId, tracking_number, 'pending', shipping_address],
      );
    }

    await connection.query("UPDATE Orders SET status = 'shipped' WHERE id = ?", [orderId]);

    await connection.commit();
    res.json({
      message: `Order ${orderId} assigned/updated with tracking number ${tracking_number}.`,
    });
  } catch (err) {
    await connection.rollback();
    console.error(`Error assigning/updating delivery for order ${orderId}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

router.get('/deliveries', async (req, res) => {
  try {
    const [deliveries] = await db.query(`
      SELECT 
        d.id,
        d.order_id,
        d.tracking_number,
        d.status,
        d.delivery_address,
        o.created_at,
        u.name as customer_name
      FROM Deliveries d
      JOIN Orders o ON d.order_id = o.id
      JOIN Users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(deliveries);
  } catch (err) {
    console.error('Error fetching deliveries for admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/deliveries/:id', async (req, res) => {
  const { id: deliveryId } = req.params;
  const { tracking_number } = req.body;

  if (!tracking_number) {
    return res.status(400).json({ error: 'tracking_number is required.' });
  }

  try {
    const [result] = await db.query('UPDATE Deliveries SET tracking_number = ? WHERE id = ?', [
      tracking_number,
      deliveryId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Delivery not found.' });
    }
    res.json({ message: 'Delivery updated successfully.' });
  } catch (err) {
    console.error(`Error updating delivery ${deliveryId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/deliveries/:id', async (req, res) => {
  const { id: deliveryId } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [deliveryRows] = await connection.query('SELECT order_id FROM Deliveries WHERE id = ?', [
      deliveryId,
    ]);

    if (deliveryRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Delivery not found.' });
    }

    const orderId = deliveryRows[0].order_id;

    await connection.query('DELETE FROM Deliveries WHERE id = ?', [deliveryId]);

    await connection.query("UPDATE Orders SET status = 'processing' WHERE id = ?", [orderId]);

    await connection.commit();
    res.json({ message: 'Delivery unassigned successfully.' });
  } catch (err) {
    await connection.rollback();
    console.error(`Error unassigning delivery ${deliveryId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

router.get('/vendors', async (req, res) => {
  try {
    const [vendors] = await db.query(`
      SELECT 
        v.id, 
        v.store_name, 
        v.email, 
        v.status, 
        v.isVerified, 
        COALESCE(SUM(p.amount), 0) as total_income
      FROM 
        Vendors v
      LEFT JOIN 
        Payouts p ON v.id = p.vendor_id
      GROUP BY
        v.id
      ORDER BY 
        v.created_at DESC
    `);
    res.json(vendors);
  } catch (err) {
    console.error('Error fetching all vendors for admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/vendors/:id', async (req, res) => {
  const { id: vendorId } = req.params;
  try {
    const [vendorRows] = await db.query(
      `
      SELECT v.*, u.id as owner_id, u.name as owner_name, u.email as owner_email, u.phone as owner_phone, u.role as owner_role
      FROM Vendors v
      JOIN Users u ON v.user_id = u.id
      WHERE v.id = ?
    `,
      [vendorId],
    );

    if (vendorRows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    const row = vendorRows[0];

    const owner = {
      id: row.owner_id,
      name: row.owner_name,
      email: row.owner_email,
      phone: row.owner_phone,
      role: row.owner_role,
    };

    delete row.owner_id;
    delete row.owner_name;
    delete row.owner_email;
    delete row.owner_phone;
    delete row.owner_role;

    const store = row;

    res.json({ owner, store });
  } catch (err) {
    console.error(`Error fetching vendor details ${vendorId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/financials', async (req, res) => {
  try {
    const [financials] = await db.query(`
      SELECT
        v.id,
        v.store_name,
        v.isVerified,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN oi.price * oi.quantity ELSE 0 END), 0) AS monthly_revenue,
        COUNT(DISTINCT o.id) AS total_orders
      FROM Vendors v
      LEFT JOIN Products p ON v.id = p.vendor_id
      LEFT JOIN Order_Items oi ON p.id = oi.product_id
      LEFT JOIN Orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
      GROUP BY v.id
      ORDER BY v.store_name;
    `);
    res.json(financials);
  } catch (err) {
    console.error('Error fetching financials for admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/vendors/:id/status', async (req, res) => {
  const { id: vendorId } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }

  try {
    const isVerified = status === 'approved';

    const [result] = await db.query('UPDATE Vendors SET status = ?, isVerified = ? WHERE id = ?', [
      status,
      isVerified,
      vendorId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    res.json({ message: `Vendor ${vendorId} status updated to ${status}.` });
  } catch (err) {
    console.error(`Error updating vendor ${vendorId} status for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/vendors/:id', async (req, res) => {
  const { id: vendorId } = req.params;
  const { store_name, description, country, city, district, status, isVerified } = req.body;

  const fieldsToUpdate = [];
  const values = [];

  if (store_name) {
    fieldsToUpdate.push('store_name = ?');
    values.push(store_name);
  }
  if (description) {
    fieldsToUpdate.push('description = ?');
    values.push(description);
  }
  if (country) {
    fieldsToUpdate.push('country = ?');
    values.push(country);
  }
  if (city) {
    fieldsToUpdate.push('city = ?');
    values.push(city);
  }
  if (district) {
    fieldsToUpdate.push('district = ?');
    values.push(district);
  }
  if (status) {
    fieldsToUpdate.push('status = ?');
    values.push(status);
  }
  if (isVerified !== undefined) {
    fieldsToUpdate.push('isVerified = ?');
    values.push(isVerified);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No fields to update provided.' });
  }

  values.push(vendorId);

  const sql = `UPDATE Vendors SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }
    res.json({ message: 'Vendor updated successfully.' });
  } catch (err) {
    console.error(`Error updating vendor ${vendorId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/vendors/:id', async (req, res) => {
  const { id: vendorId } = req.params;
  try {
    const [result] = await db.query('DELETE FROM Vendors WHERE id = ?', [vendorId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }
    res.json({ message: `Vendor ${vendorId} has been deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, v.store_name
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.id
      ORDER BY p.id DESC
    `);
    res.json(products);
  } catch (err) {
    console.error('Error fetching all products for admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  const { id: productId } = req.params;
  try {
    const [result] = await db.query('DELETE FROM Products WHERE id = ?', [productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ message: `Product ${productId} has been deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/products/:id', async (req, res) => {
  const { id: product_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.*, 
        v.store_name, 
        v.description AS store_description,
        v.country, v.city, v.district, v.logo_url, v.isVerified, v.status AS vendor_status,
        c.name AS category_name
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.id
      JOIN Categories c ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [product_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const product = rows[0];

    // Parse JSON image URLs
    try {
      product.image_urls = Array.isArray(product.image_urls)
        ? product.image_urls
        : JSON.parse(product.image_urls);
    } catch {
      product.image_urls = [];
    }

    res.json(product);
  } catch (err) {
    console.error(`Error fetching product details ${product_id}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/categories', async (req, res) => {
  const { name, image_url } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    const [result] = await db.query('INSERT INTO Categories (name, image_url) VALUES (?, ?)', [
      name,
      image_url,
    ]);
    res.status(201).json({
      message: 'Category created successfully.',
      categoryId: result.insertId,
    });
  } catch (err) {
    console.error('Error creating category for admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/categories/:id', async (req, res) => {
  const { id: categoryId } = req.params;
  const { name, image_url } = req.body;

  if (!name && !image_url) {
    return res.status(400).json({ error: 'No fields to update provided.' });
  }

  const fieldsToUpdate = [];
  const values = [];

  if (name) {
    fieldsToUpdate.push('name = ?');
    values.push(name);
  }
  if (image_url) {
    fieldsToUpdate.push('image_url = ?');
    values.push(image_url);
  }

  values.push(categoryId);

  const sql = `UPDATE Categories SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    console.error(`Error updating category ${categoryId} for admin:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  const { id: categoryId } = req.params;
  try {
    const [result] = await db.query('DELETE FROM Categories WHERE id = ?', [categoryId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.json({ message: `Category ${categoryId} has been deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const { duration } = req.query;

    let interval = '30 DAY';
    if (duration === 'weekly') {
      interval = '7 DAY';
    } else if (duration === '6months') {
      interval = '6 MONTH';
    }

    const [userCount] = await db.query("SELECT COUNT(*) as total FROM Users WHERE role != 'admin'");
    const [vendorCount] = await db.query('SELECT COUNT(*) as total FROM Vendors');
    const [productCount] = await db.query('SELECT COUNT(*) as total FROM Products');
    const [pendingOrderCount] = await db.query(
      "SELECT COUNT(*) as total FROM Orders WHERE status = 'pending'",
    );

    const [revenueResult] = await db.query(
      "SELECT SUM(total) as totalRevenue FROM Orders WHERE status NOT IN ('pending', 'cancelled', 'denied')",
    );
    const totalRevenue = parseFloat(revenueResult[0].totalRevenue) || 0;

    // Calculate total payouts to vendors
    const [payoutResult] = await db.query('SELECT SUM(amount) as totalPayouts FROM Payouts');
    const totalPayouts = parseFloat(payoutResult[0].totalPayouts) || 0;

    const platformCommission = parseFloat((totalRevenue - totalPayouts).toFixed(2));

    const [recentUsers] = await db.query(
      'SELECT COUNT(*) as total FROM Users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    );
    const [recentVendors] = await db.query(
      'SELECT COUNT(*) as total FROM Vendors WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    );
    const [recentOrders] = await db.query('SELECT * FROM Orders ORDER BY created_at DESC LIMIT 5');

    const [salesOverTime] = await db.query(`
      SELECT DATE(created_at) as date, SUM(total) as revenue
      FROM Orders
      WHERE status NOT IN ('pending', 'cancelled', 'denied') AND created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const [topProducts] = await db.query(`
      SELECT p.name, SUM(oi.quantity) as total_sold
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    const [topVendors] = await db.query(`
      SELECT v.store_name, SUM(p.amount) as total_payout
      FROM Payouts p
      JOIN Vendors v ON p.vendor_id = v.id
      WHERE p.status = 'completed'
      GROUP BY v.id
      ORDER BY total_payout DESC
      LIMIT 5
    `);

    const [payoutsOverTime] = await db.query(`
      SELECT DATE(created_at) as date, SUM(amount) as payout
      FROM Payouts
      WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      coreStats: {
        totalUsers: userCount[0].total,
        totalVendors: vendorCount[0].total,
        totalProducts: productCount[0].total,
        pendingOrders: pendingOrderCount[0].total, // <-- updated
      },
      financials: {
        totalRevenue,
        platformCommission,
      },
      recentActivity: {
        newUserSignups: recentUsers[0].total,
        newVendorRegistrations: recentVendors[0].total,
        recentOrders,
      },
      charts: {
        salesOverTime,
        payoutsOverTime,
        topSellingProducts: topProducts,
        topPerformingVendors: topVendors,
      },
    });
  } catch (err) {
    console.error('Error fetching admin dashboard data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
