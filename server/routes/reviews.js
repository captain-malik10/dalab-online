import express from 'express';
import db from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Create a new review
router.post('/', authenticateToken, async (req, res) => {
  const customer_id = req.user.id;
  const { product_id, rating, comment } = req.body;

  if (!product_id || !rating) {
    return res.status(400).json({ error: 'Product ID and rating are required.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO Reviews (product_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [product_id, customer_id, rating, comment],
    );

    const [newReview] = await db.query(
      'SELECT r.*, u.name as customer_name FROM Reviews r JOIN Users u ON r.customer_id = u.id WHERE r.id = ?',
      [result.insertId],
    );

    res.status(201).json(newReview[0]);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all reviews for the current user
router.get('/me', authenticateToken, async (req, res) => {
  const customer_id = req.user.id;

  try {
    const [reviews] = await db.query('SELECT * FROM Reviews WHERE customer_id = ?', [customer_id]);
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a review
router.delete('/:id', authenticateToken, async (req, res) => {
  const customer_id = req.user.id;
  const { id: reviewId } = req.params;

  try {
    const [result] = await db.query('DELETE FROM Reviews WHERE id = ? AND customer_id = ?', [
      reviewId,
      customer_id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Review not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
