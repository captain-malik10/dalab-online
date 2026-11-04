import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM Categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
