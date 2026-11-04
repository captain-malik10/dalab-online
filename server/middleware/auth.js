import jwt from 'jsonwebtoken';

// Tokens carry a `type` claim: 'user' (customer/vendor-owner/admin accounts from the
// Users table) or 'vendor' (store logins from the Vendors table). The ids come from
// different tables, so the two kinds must never be accepted interchangeably.
const verifyToken = (req, res, next, allowedTypes) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Session ended. Please log in again.' });
    }
    if (!allowedTypes.includes(payload.type)) {
      return res.status(403).json({ error: 'This account type cannot access this resource.' });
    }
    req.user = payload;
    next();
  });
};

// User accounts only (customers, admins, store owners acting as customers).
const authenticateToken = (req, res, next) => verifyToken(req, res, next, ['user']);

// Store (vendor) logins only.
export const requireVendor = (req, res, next) => verifyToken(req, res, next, ['vendor']);

// Either kind of account (e.g. image uploads).
export const authenticateAny = (req, res, next) => verifyToken(req, res, next, ['user', 'vendor']);

export default authenticateToken;
