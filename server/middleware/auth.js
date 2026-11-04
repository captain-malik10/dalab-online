import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('!!! DEBUG: JWT verification failed. Error:', err);
      return res.status(401).json({ error: 'Session ended. Please log in again.' });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
