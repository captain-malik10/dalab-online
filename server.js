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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
app.use('/api/orders', ordersRoutes);
app.use('/api/contact', contactRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
