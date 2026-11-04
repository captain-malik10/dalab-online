import express from 'express';
import db from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper function to get or create a wishlist for a customer
const getOrCreateWishlist = async (customerId) => {
  let [wishlist] = await db.query('SELECT id FROM Wishlists WHERE customer_id = ?', [customerId]);
  if (!wishlist || wishlist.length === 0) {
    const [result] = await db.query('INSERT INTO Wishlists (customer_id) VALUES (?)', [customerId]);
    return result.insertId;
  }
  return wishlist[0].id;
};

// Helper function to get or create a cart for a customer
const getOrCreateCart = async (customerId) => {
  let [cart] = await db.query('SELECT id FROM Carts WHERE customer_id = ?', [customerId]);
  if (!cart || cart.length === 0) {
    const [result] = await db.query('INSERT INTO Carts (customer_id) VALUES (?)', [customerId]);
    return result.insertId;
  }
  return cart[0].id;
};

// GET /api/wishlist - Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const wishlistId = await getOrCreateWishlist(customerId);

    const [items] = await db.query(
      `
            SELECT 
                wi.id, 
                p.id as productId, 
                p.name, 
                p.price, 
                p.image_urls,
                p.description,
                c.name as category_name,
                v.store_name as vendor_name,
                AVG(r.rating) as averageRating,
                COUNT(DISTINCT r.id) as totalReviews,
                SUM(CASE WHEN o.status = 'completed' THEN oi.quantity ELSE 0 END) as timesSold
            FROM Wishlist_Items wi
            JOIN Products p ON wi.product_id = p.id
            JOIN Categories c ON p.category_id = c.id
            JOIN Vendors v ON p.vendor_id = v.id
            LEFT JOIN Reviews r ON p.id = r.product_id
            LEFT JOIN Order_Items oi ON p.id = oi.product_id
            LEFT JOIN Orders o ON oi.order_id = o.id
            WHERE wi.wishlist_id = ?
            GROUP BY wi.id, p.id, c.name, v.store_name
        `,
      [wishlistId],
    );

    res.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/wishlist/items - Add item to wishlist
router.post('/items', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const wishlistId = await getOrCreateWishlist(customerId);

    const [existingItems] = await db.query(
      'SELECT id FROM Wishlist_Items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId],
    );

    if (existingItems.length > 0) {
      return res.status(409).json({ message: 'Item already in wishlist' });
    }

    await db.query('INSERT INTO Wishlist_Items (wishlist_id, product_id) VALUES (?, ?)', [
      wishlistId,
      productId,
    ]);

    res.status(201).json({ message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/wishlist/items/:itemId - Remove item from wishlist
router.delete('/items/:itemId', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params;
    const wishlistId = await getOrCreateWishlist(customerId);

    const [item] = await db.query(
      'SELECT id FROM Wishlist_Items WHERE id = ? AND wishlist_id = ?',
      [itemId, wishlistId],
    );

    if (item.length === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    await db.query('DELETE FROM Wishlist_Items WHERE id = ?', [itemId]);

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/wishlist/items/:itemId/move-to-cart - Move item from wishlist to cart
router.post('/items/:itemId/move-to-cart', auth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { itemId } = req.params; // This is wishlist_item_id

    const wishlistId = await getOrCreateWishlist(customerId);

    // Get product_id from wishlist item
    const [wishlistItems] = await db.query(
      'SELECT product_id FROM Wishlist_Items WHERE id = ? AND wishlist_id = ?',
      [itemId, wishlistId],
    );

    if (wishlistItems.length === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    const { product_id: productId } = wishlistItems[0];

    // Add to cart logic
    const cartId = await getOrCreateCart(customerId);
    const [cartItems] = await db.query(
      'SELECT id, quantity FROM Cart_Items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId],
    );

    if (cartItems.length > 0) {
      // Item exists in cart, update quantity
      const newQuantity = cartItems[0].quantity + 1;
      await db.query('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [
        newQuantity,
        cartItems[0].id,
      ]);
    } else {
      // Item does not exist in cart, insert it
      await db.query('INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, 1)', [
        cartId,
        productId,
      ]);
    }

    // Remove from wishlist
    await db.query('DELETE FROM Wishlist_Items WHERE id = ?', [itemId]);

    res.json({ message: 'Item moved to cart' });
  } catch (error) {
    console.error('Error moving item to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
