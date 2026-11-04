import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import authenticateToken, { requireVendor } from '../middleware/auth.js';
import multer from 'multer';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf'),
});

const vendorUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'license', maxCount: 1 },
]);

const productUpload = upload.array('images', 10);

// Collect product image URLs: uploaded files (only when ImageKit is configured)
// plus any URLs pasted into the "imageUrls" field (JSON array or one per line).
const parsePastedUrls = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).map((u) => u.trim()).filter(Boolean);
  } catch {
    // not JSON, fall through to line/comma splitting
  }
  return String(raw)
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);
};

const collectImageUrls = async (req) => {
  const urls = parsePastedUrls(req.body.imageUrls);
  if (req.files && req.files.length > 0) {
    if (!isImageKitConfigured) {
      const err = new Error('Image upload is not configured on this server. Please paste image URLs instead.');
      err.status = 400;
      throw err;
    }
    const uploadResults = await Promise.all(
      req.files.map((file) =>
        imagekit.upload({ file: file.buffer, fileName: file.originalname, folder: '/products' }),
      ),
    );
    urls.push(...uploadResults.map((result) => result.url));
  }
  return urls;
};

router.post('/register', authenticateToken, async (req, res) => {
  const creatorUserId = req.user.id;
  const { email, password, store_name, description, country, city, district } = req.body;

  if (!email || !password || !store_name) {
    return res.status(400).json({
      error: 'Please provide email, password, and store name for the new store',
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existingVendors] = await connection.query('SELECT * FROM Vendors WHERE email = ?', [
      email,
    ]);
    if (existingVendors.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'A store with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [vendorResult] = await connection.query(
      'INSERT INTO Vendors (user_id, email, password, store_name, description, country, city, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [creatorUserId, email, hashedPassword, store_name, description, country, city, district],
    );

    const [users] = await connection.query('SELECT role FROM Users WHERE id = ?', [creatorUserId]);
    if (users.length > 0 && users[0].role === 'customer') {
      await connection.query('UPDATE Users SET role = ? WHERE id = ?', ['vendor', creatorUserId]);
    }

    await connection.commit();
    res.status(201).json({
      message: 'Vendor details saved.',
      vendorId: vendorResult.insertId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error in step 1 registration:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

router.put('/register/uploads/:vendorId', authenticateToken, vendorUpload, async (req, res) => {
  const { vendorId } = req.params;
  const requestingUserId = req.user.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [vendors] = await connection.query(
      'SELECT user_id, store_name FROM Vendors WHERE id = ?',
      [vendorId],
    );

    if (vendors.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    const vendor = vendors[0];
    if (vendor.user_id !== requestingUserId) {
      await connection.rollback();
      return res.status(403).json({ error: 'Forbidden: You cannot update this store.' });
    }

    const sanitizedStoreName = vendor.store_name.toLowerCase().replace(/\s+/g, '-');

    let logoUrl = null;
    let licenseUrl = null;

    if (isImageKitConfigured && req.files && req.files.logo) {
      const logoUpload = await imagekit.upload({
        file: req.files.logo[0].buffer,
        fileName: `${sanitizedStoreName}-logo`,
        folder: `stores/${sanitizedStoreName}`,
      });
      logoUrl = logoUpload.url;
    }

    if (isImageKitConfigured && req.files && req.files.license) {
      const licenseUpload = await imagekit.upload({
        file: req.files.license[0].buffer,
        fileName: `${sanitizedStoreName}-license`,
        folder: `stores/${sanitizedStoreName}`,
      });
      licenseUrl = licenseUpload.url;
    }

    await connection.query(
      'UPDATE Vendors SET logo_url = ?, license_url = ?, isVerified = false WHERE id = ?',
      [logoUrl, licenseUrl, vendorId],
    );

    await connection.commit();
    res.status(200).json({ message: 'Files uploaded and store updated successfully.' });
  } catch (err) {
    await connection.rollback();
    console.error('Error in step 2 registration (uploads):', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM Vendors WHERE email = ?', [email]);
    const vendor = rows[0];

    if (!vendor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: vendor.id, role: 'vendor', type: 'vendor' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, store_name: vendor.store_name });
  } catch (err) {
    console.error('Error logging in vendor:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const [vendors] = await db.query('SELECT * FROM Vendors WHERE id = ?', [vendorId]);
    if (vendors.length === 0) {
      return res.status(404).json({ error: 'No store found for this vendor ID.' });
    }
    res.json(vendors[0]);
  } catch (err) {
    console.error('Error fetching vendor details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/products', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const sql = `
      SELECT p.*, c.name as category_name
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      WHERE p.vendor_id = ?
    `;
    const [products] = await db.query(sql, [vendorId]);
    res.json(products);
  } catch (err) {
    console.error('Error fetching vendor products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/products', requireVendor, productUpload, async (req, res) => {
  const vendorId = req.user.id;
  const { category_id, name, price, description, isFeatured, stock } = req.body;

  if (!name || !price || !category_id || !stock) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  let imageUrls;
  try {
    imageUrls = await collectImageUrls(req);
  } catch (err) {
    console.error('Error processing product images:', err);
    return res.status(err.status || 500).json({ error: err.status ? err.message : 'Image upload failed' });
  }
  if (imageUrls.length === 0) {
    return res.status(400).json({ error: 'Please upload an image or paste at least one image URL' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO Products (vendor_id, category_id, name, price, description, image_urls, isFeatured, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        vendorId,
        category_id,
        name,
        price,
        description,
        JSON.stringify(imageUrls),
        isFeatured === 'true' || isFeatured === '1',
        stock,
      ],
    );

    await connection.commit();
    res.status(201).json({ message: 'Product created', productId: result.insertId });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

router.put('/products/:id', requireVendor, productUpload, async (req, res) => {
  const vendorId = req.user.id;
  const productId = req.params.id;
  const { category_id, name, price, description, isFeatured, stock, existingImageUrls } = req.body;

  if (!name || !price || !category_id || !stock) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify vendor owns the product
    const [productRows] = await connection.query(
      'SELECT vendor_id, image_urls FROM Products WHERE id = ?',
      [productId],
    );
    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }
    if (productRows[0].vendor_id !== vendorId) {
      await connection.rollback();
      return res.status(403).json({ error: 'Forbidden' });
    }

    const newImageUrls = await collectImageUrls(req);

    const finalImageUrls = [...JSON.parse(existingImageUrls || '[]'), ...newImageUrls];

    await connection.query(
      'UPDATE Products SET category_id = ?, name = ?, price = ?, description = ?, image_urls = ?, isFeatured = ?, stock = ? WHERE id = ?',
      [
        category_id,
        name,
        price,
        description,
        JSON.stringify(finalImageUrls),
        isFeatured === 'true' || isFeatured === '1',
        stock,
        productId,
      ],
    );

    await connection.commit();
    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating product:', err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Server error' });
  } finally {
    connection.release();
  }
});

router.delete('/products/:id', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id: productId } = req.params;

    const [result] = await db.query('DELETE FROM Products WHERE id = ? AND vendor_id = ?', [
      productId,
      vendorId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Product not found or you do not have permission to delete it.',
      });
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/products/:id', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id: productId } = req.params;

    const [products] = await db.query('SELECT * FROM Products WHERE id = ? AND vendor_id = ?', [
      productId,
      vendorId,
    ]);

    if (products.length === 0) {
      return res.status(404).json({
        error: 'Product not found or you do not have permission to view it.',
      });
    }

    const product = products[0];
    const categoryId = product.category_id;

    const [relatedProducts] = await db.query(
      'SELECT * FROM Products WHERE category_id = ? AND id != ? LIMIT 5',
      [categoryId, productId],
    );

    res.json({ product, relatedProducts });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;

    const sql = `
      SELECT 
        o.id, 
        u.name as customer_name, 
        o.total, 
        o.status, 
        o.created_at,
        SUM(oi.price * oi.quantity) as store_cut
      FROM Orders o
      JOIN Order_Items oi ON o.id = oi.order_id
      JOIN Products p ON oi.product_id = p.id
      JOIN Users u ON o.customer_id = u.id
      WHERE p.vendor_id = ?
      GROUP BY o.id
      ORDER BY o.id DESC
    `;

    const [orders] = await db.query(sql, [vendorId]);

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders/:id', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id: orderId } = req.params;

    const authSql = `
      SELECT o.id
      FROM Orders o
      JOIN Order_Items oi ON o.id = oi.order_id
      JOIN Products p ON oi.product_id = p.id
      WHERE p.vendor_id = ? AND o.id = ?
      LIMIT 1
    `;
    const [authResult] = await db.query(authSql, [vendorId, orderId]);

    if (authResult.length === 0) {
      return res.status(404).json({
        error: 'Order not found or you do not have permission to view it.',
      });
    }

    const orderDetailSql = `
      SELECT o.id, o.total, o.status, o.payment_status, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM Orders o
      JOIN Users u ON o.customer_id = u.id
      WHERE o.id = ?
    `;
    const [orderDetails] = await db.query(orderDetailSql, [orderId]);
    const [orderItems] = await db.query('SELECT * FROM Order_Items WHERE order_id = ?', [orderId]);

    const orderData = orderDetails[0];

    const response = {
      customer: {
        name: orderData.customer_name,
        email: orderData.customer_email,
        phone: orderData.customer_phone,
      },
      order: {
        id: orderData.id,
        total: orderData.total,
        status: orderData.status,
        payment_status: orderData.payment_status,
      },
      items: orderItems,
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/me', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { store_name, description, country, city, district, logo_url, license_url } = req.body;

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
    if (logo_url) {
      fieldsToUpdate.push('logo_url = ?');
      values.push(logo_url);
    }
    if (license_url) {
      fieldsToUpdate.push('license_url = ?');
      values.push(license_url);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No fields to update provided.' });
    }

    values.push(vendorId);

    const sql = `UPDATE Vendors SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    res.json({ message: 'Store profile updated successfully.' });
  } catch (err) {
    console.error('Error updating store profile:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/dashboard', requireVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Total products for this vendor
    const [productsResult] = await db.query(
      'SELECT COUNT(*) as totalProducts FROM Products WHERE vendor_id = ?',
      [vendorId],
    );

    // Pending orders for this vendor
    const [pendingOrdersResult] = await db.query(
      `
      SELECT COUNT(DISTINCT o.id) as pendingOrders
      FROM Orders o
      JOIN Order_Items oi ON o.id = oi.order_id
      JOIN Products p ON oi.product_id = p.id
      WHERE p.vendor_id = ? AND o.status = 'pending'
    `,
      [vendorId],
    );

    // Total revenue for this vendor = sum of **payouts**
    const [payoutResult] = await db.query(
      `
      SELECT SUM(amount) as totalRevenue
      FROM Payouts
      WHERE vendor_id = ?
    `,
      [vendorId],
    );
    const totalRevenue = parseFloat(payoutResult[0].totalRevenue) || 0;

    // Total products sold by this vendor
    const [totalProductsSoldResult] = await db.query(
      `
      SELECT SUM(oi.quantity) as totalProductsSold
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.id
      WHERE p.vendor_id = ?
    `,
      [vendorId],
    );
    const totalProductsSold = totalProductsSoldResult[0].totalProductsSold || 0;

    // Revenue by day for the last 30 days (from payouts)
    const [revenueByDayResult] = await db.query(
      `
      SELECT DATE(p.created_at) as date, SUM(p.amount) as revenue
      FROM Payouts p
      WHERE p.vendor_id = ? AND p.status = 'completed' AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(p.created_at)
      ORDER BY date ASC
    `,
      [vendorId],
    );

    const summary = {
      totalProducts: productsResult[0].totalProducts || 0,
      pendingOrders: pendingOrdersResult[0].pendingOrders || 0,
      totalRevenue,
      totalProductsSold,
      revenueByDay: revenueByDayResult,
    };

    res.json(summary);
  } catch (err) {
    console.error('Error fetching vendor dashboard data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
