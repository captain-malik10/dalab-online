import express from 'express';
import db from '../config/db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, email, phone, role FROM Users');
    res.json(results);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, role FROM Users WHERE id = ?', [
      req.user.id,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query('DELETE FROM Users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const allowedFields = ['name', 'phone', 'email', 'password', 'role'];
  const fieldsToUpdate = [];
  const values = [];

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update provided.' });
  }

  values.push(userId);

  const sql = `UPDATE Users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User profile updated successfully.' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
