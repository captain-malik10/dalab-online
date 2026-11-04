import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json({ products: [], stores: [] });
  }

  try {
    const searchTerm = `%${q}%`;

    // Search for products
    const [products] = await db.query(
      `
      SELECT 
        p.id, 
        p.name, 
        p.image_urls
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.id
      WHERE p.name LIKE ? AND v.status != 'rejected'
      LIMIT 5
      `,
      [searchTerm]
    );

    // Search for stores
    const [stores] = await db.query(
      `
      SELECT 
        v.id, 
        v.store_name, 
        v.logo_url 
      FROM Vendors v
      WHERE v.store_name LIKE ? AND v.status != 'rejected'
      LIMIT 5
      `,
      [searchTerm]
    );
    
    const formattedProducts = products.map((product) => {
      let imageUrls = [];
      if (product.image_urls) {
        try {
          imageUrls = JSON.parse(product.image_urls);
        } catch (e) {
          imageUrls = [product.image_urls];
        }
      }
      return {
        ...product,
        image_urls: imageUrls,
      };
    });


    res.json({ products: formattedProducts, stores });
  } catch (err) {
    console.error('Error performing search:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
