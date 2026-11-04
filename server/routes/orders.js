import express from 'express';
import db from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper function to get cart items for order creation
const getCartItems = async (customerId) => {
  const [cart] = await db.query('SELECT id FROM Carts WHERE customer_id = ?', [customerId]);
  if (!cart || cart.length === 0) {
    return [];
  }

  const [items] = await db.query(
    `SELECT 
      ci.product_id, 
      ci.quantity, 
      p.price,
      p.name as product_name,
      p.vendor_id,
      v.store_name as vendor_name
    FROM Cart_Items ci
    JOIN Products p ON ci.product_id = p.id
    JOIN Vendors v ON p.vendor_id = v.id
    WHERE ci.cart_id = ?`,
    [cart[0].id],
  );

  return items;
};

// Create a new order from cart
router.post('/', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { shipping_address } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get cart items
    const cartItems = await getCartItems(customerId);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Create order
      const [orderResult] = await db.query(
        "INSERT INTO Orders (customer_id, total, shipping_address, status, payment_status) VALUES (?, ?, ?, 'pending', 'pending')",
        [customerId, total, shipping_address],
      );

      const orderId = orderResult.insertId;

      // Create order items
      for (const item of cartItems) {
        await db.query(
          'INSERT INTO Order_Items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price],
        );
      }

      // Clear cart
      const [cart] = await db.query('SELECT id FROM Carts WHERE customer_id = ?', [customerId]);
      if (cart && cart.length > 0) {
        await db.query('DELETE FROM Cart_Items WHERE cart_id = ?', [cart[0].id]);
      }

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        orderId: orderId,
        total: total,
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders for a customer
router.get('/', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM Orders o
      LEFT JOIN Order_Items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
    `;

    const params = [customerId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific order with items
router.get('/:orderId', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    // Get order details
    const [orders] = await db.query(
      `SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        o.updated_at
      FROM Orders o
      WHERE o.id = ? AND o.customer_id = ?`,
      [orderId, customerId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const [items] = await db.query(
      `SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        p.id as product_id,
        p.name as product_name,
        p.image_urls,
        p.vendor_id,
        v.store_name as vendor_name,
        c.name as category_name
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.id
      JOIN Vendors v ON p.vendor_id = v.id
      JOIN Categories c ON p.category_id = c.id
      WHERE oi.order_id = ?`,
      [orderId],
    );

    res.json({
      order: orders[0],
      items: items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (customer can only cancel pending orders)
router.put('/:orderId', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    // Check if order exists and belongs to customer
    const [orders] = await db.query(
      'SELECT id, status FROM Orders WHERE id = ? AND customer_id = ?',
      [orderId, customerId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = orders[0].status;

    // Customer can only cancel pending orders
    if (status === 'cancelled' && currentStatus === 'pending') {
      await db.query(
        "UPDATE Orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [orderId],
      );

      res.json({ message: 'Order cancelled successfully' });
    } else {
      res.status(400).json({
        message: 'Invalid status update. You can only cancel pending orders.',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:orderId', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    // Check if order exists and belongs to customer
    const [orders] = await db.query(
      'SELECT id, status FROM Orders WHERE id = ? AND customer_id = ?',
      [orderId, customerId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = orders[0].status;

    // Only allow deletion if order is still pending
    if (currentStatus === 'cancelled') {
      await db.query('DELETE FROM Orders WHERE id = ?', [orderId]);
      res.json({ message: 'Order deleted successfully' });
    } else {
      res.status(400).json({
        message: 'You can only delete cancelled orders.',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:orderId/delivered', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;

    const [orders] = await db.query(
      'SELECT id, status FROM Orders WHERE id = ? AND customer_id = ?',
      [orderId, customerId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found or does not belong to user' });
    }

    const currentStatus = orders[0].status;

    if (currentStatus !== 'shipped') {
      return res
        .status(400)
        .json({ message: "Order must be 'shipped' to be marked as delivered." });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE Orders SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [orderId],
      );

      await connection.query(
        "UPDATE Deliveries SET status = 'delivered' WHERE order_id = ?",
        [orderId],
      );

      await connection.commit();
      res.json({ message: 'Order marked as delivered successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/:orderId/payment', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId } = req.params;
    const { method, phone_number } = req.body;

    if (!method || !phone_number) {
      return res.status(400).json({ message: 'Payment method and phone number are required' });
    }

    if (!['EVC plus', 'Edahab'].includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Check if order exists and belongs to customer
    const [orders] = await db.query(
      'SELECT id, total, payment_status FROM Orders WHERE id = ? AND customer_id = ?',
      [orderId, customerId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    if (order.payment_status === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Create payment record
    const [paymentResult] = await db.query(
      "INSERT INTO Payments (order_id, amount, method, phone_number, status) VALUES (?, ?, ?, ?, 'pending')",
      [orderId, order.total, method, phone_number],
    );

    res.status(201).json({
      message: 'Payment initiated successfully',
      paymentId: paymentResult.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics for customer
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const customerId = req.user.id;

    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as total_spent
      FROM Orders 
      WHERE customer_id = ?`,
      [customerId],
    );

    res.json(stats[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
