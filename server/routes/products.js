import express from 'express';
import db from '../config/db.js';
import { parseImageUrls } from '../utils/images.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { categoryName, vendorName, minPrice, maxPrice, featured } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.image_urls,
        p.isFeatured,
        p.stock,
        v.store_name AS vendor_name,
        c.name AS category_name,
        AVG(r.rating) as averageRating,
        COUNT(r.id) as totalReviews
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.id
      JOIN Categories c ON p.category_id = c.id
      LEFT JOIN Reviews r ON p.id = r.product_id
      WHERE v.status != 'rejected'
    `;

    const params = [];

    if (categoryName) {
      query += ' AND c.name = ?';
      params.push(categoryName);
    }

    if (vendorName) {
      query += ' AND v.store_name = ?';
      params.push(vendorName);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    if (featured) {
      query += ' AND p.isFeatured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    query += ' GROUP BY p.id ORDER BY p.id DESC';

    const [products] = await db.query(query, params);

    const formatted = products.map((product) => {
      const imageUrls = parseImageUrls(product.image_urls);
      return {
        ...product,
        image_urls: imageUrls,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single product details with store info and reviews
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get product details with store and category info
    const productQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.image_urls,
        p.isFeatured,
        p.stock,
        p.created_at,
        p.updated_at,
        v.id as vendor_id,
        v.store_name,
        v.description as store_description,
        v.country,
        v.city,
        v.district,
        v.logo_url,
        v.isVerified,
        v.status as vendor_status,
        c.id as category_id,
        c.name as category_name,
        c.image_url as category_image
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.id
      JOIN Categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const [products] = await db.query(productQuery, [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    // Check if the vendor is rejected
    if (product.vendor_status === 'rejected') {
      return res.status(404).json({ error: 'Product not found (vendor rejected)' });
    }

    // Parse image URLs
    const imageUrls = parseImageUrls(product.image_urls);

    // Get reviews for this product
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as customer_name,
        u.id as customer_id
      FROM Reviews r
      JOIN Users u ON r.customer_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `;

    const [reviews] = await db.query(reviewsQuery, [id]);

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    // Get related products (same category, different product)
    const relatedQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_urls,
        p.isFeatured,
        v.store_name AS vendor_name
      FROM Products p
      JOIN Vendors v ON p.vendor_id = v.id
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY p.isFeatured DESC, p.created_at DESC
      LIMIT 6
    `;

    const [relatedProducts] = await db.query(relatedQuery, [product.category_id, id]);

    // Format related products
    const formattedRelated = relatedProducts.map((related) => {
      const relatedImageUrls = parseImageUrls(related.image_urls);
      return {
        ...related,
        image_urls: relatedImageUrls,
      };
    });

    // Format the response
    const response = {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image_urls: imageUrls,
        isFeatured: product.isFeatured,
        stock: product.stock,
        created_at: product.created_at,
        updated_at: product.updated_at,
        category: {
          id: product.category_id,
          name: product.category_name,
          image_url: product.category_image,
        },
      },
      store: {
        id: product.vendor_id,
        name: product.store_name,
        description: product.store_description,
        country: product.country,
        city: product.city,
        district: product.district,
        logo_url: product.logo_url,
        isVerified: product.isVerified,
        status: product.vendor_status,
      },
      reviews: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        reviews: reviews,
      },
      relatedProducts: formattedRelated,
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
