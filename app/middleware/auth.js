import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('!!! DEBUG: JWT verification failed. Error:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
