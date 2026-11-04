import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './server/routes/auth.js';
import vendorRoutes from './server/routes/vendors.js';
import vendorsPublicRoutes from './server/routes/vendors-public.js';
import userRoutes from './server/routes/users.js';
import adminRoutes from './server/routes/admin.js';
import categoryRoutes from './server/routes/categories.js';
import uploadRoutes from './server/routes/upload.js';
import productsRoutes from './server/routes/products.js';
import reviewRoutes from './server/routes/reviews.js';
import cartRoutes from './server/routes/cart.js';
import wishlistRoutes from './server/routes/wishlist.js';
import searchRoutes from './server/routes/search.js';
import ordersRoutes from './server/routes/orders.js';
import contactRoutes from './server/routes/contact.js';
import aiRoutes from './server/routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Behind Railway's proxy: use the client IP from X-Forwarded-For (for rate limiting)
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api', (req, res) => {
  res.json({ message: 'Server is running successfully' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendors-public', vendorsPublicRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// Unknown API routes return JSON 404 instead of the SPA page
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Serve the built React SPA
const clientDir = path.join(__dirname, 'build', 'client');
app.use(express.static(clientDir));

// SPA fallback: any other GET returns index.html so client-side routing works
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
