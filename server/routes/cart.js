import express from 'express';
import db from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// to get or create a cart for a customer
const getOrCreateCart = async (customerId) => {
  let [cart] = await db.query('SELECT id FROM Carts WHERE customer_id = ?', [customerId]);
  if (!cart || cart.length === 0) {
    const [result] = await db.query('INSERT INTO Carts (customer_id) VALUES (?)', [customerId]);
    return result.insertId;
  }
  return cart[0].id;
};

// to get the cart items
router.get('/', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const cartId = await getOrCreateCart(customerId);

    const [items] = await db.query(
      `
            SELECT 
                ci.id, 
                ci.quantity, 
                p.id as productId, 
                p.name, 
                p.price, 
                p.image_urls, 
                p.category_id, 
                c.name as category_name,
                p.vendor_id,
                v.store_name as vendor_name
            FROM Cart_Items ci
            JOIN Products p ON ci.product_id = p.id
            JOIN Categories c ON p.category_id = c.id
            JOIN Vendors v ON p.vendor_id = v.id
            WHERE ci.cart_id = ?
        `,
      [cartId],
    );

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// to add an item to the cart
router.post('/items', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const cartId = await getOrCreateCart(customerId);

    const [existingItems] = await db.query(
      'SELECT id, quantity FROM Cart_Items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId],
    );

    if (existingItems.length > 0) {
      const newQuantity = existingItems[0].quantity + quantity;
      await db.query('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [
        newQuantity,
        existingItems[0].id,
      ]);
      res.status(200).json({ message: 'Item quantity updated in cart' });
    } else {
      await db.query('INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [
        cartId,
        productId,
        quantity,
      ]);
      res.status(201).json({ message: 'Item added to cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// to update the quantity of an item in the cart
router.put('/items/:itemId', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const cartId = await getOrCreateCart(customerId);

    const [item] = await db.query('SELECT id FROM Cart_Items WHERE id = ? AND cart_id = ?', [
      itemId,
      cartId,
    ]);

    if (item.length === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await db.query('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [quantity, itemId]);

    res.json({ message: 'Item quantity updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// to remove an item from the cart
router.delete('/items/:itemId', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;
    const cartId = await getOrCreateCart(customerId);

    const [item] = await db.query('SELECT id FROM Cart_Items WHERE id = ? AND cart_id = ?', [
      itemId,
      cartId,
    ]);

    if (item.length === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await db.query('DELETE FROM Cart_Items WHERE id = ?', [itemId]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// to clear all items from the cart
router.delete('/', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const cartId = await getOrCreateCart(customerId);
    await db.query('DELETE FROM Cart_Items WHERE cart_id = ?', [cartId]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
