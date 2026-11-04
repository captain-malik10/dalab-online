import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        v.id,
        v.store_name,
        v.description,
        v.country,
        v.city,
        v.district,
        v.logo_url,
        v.isVerified,
        v.status,
        v.created_at,
        v.updated_at,
        COUNT(p.id) as product_count
      FROM Vendors v
      LEFT JOIN Products p ON v.id = p.vendor_id
      WHERE v.status != 'rejected'
      GROUP BY v.id
      ORDER BY v.store_name ASC
    `;
    const [vendors] = await db.query(query);

    const formatted = vendors.map((vendor) => ({
      id: vendor.id,
      store_name: vendor.store_name,
      description: vendor.description,
      country: vendor.country,
      city: vendor.city,
      district: vendor.district,
      logo_url: vendor.logo_url,
      isVerified: vendor.isVerified,
      status: vendor.status,
      product_count: vendor.product_count,
      created_at: vendor.created_at,
      updated_at: vendor.updated_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id: vendorId } = req.params;

  const safeParseJSON = (value) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value ? [value] : [];
    }
  };

  try {
    const [vendorRows] = await db.query(
      `
      SELECT
        v.id,
        v.store_name,
        v.email,
        v.description,
        v.country,
        v.city,
        v.district,
        v.logo_url,
        v.license_url,
        v.isVerified,
        v.status,
        v.created_at,
        v.updated_at,
        COUNT(DISTINCT p.id) AS product_count,
        AVG(r.rating) AS averageRating,
        COUNT(r.id) AS totalReviews
      FROM Vendors v
      LEFT JOIN Products p ON v.id = p.vendor_id
      LEFT JOIN Reviews r ON p.id = r.product_id
      WHERE v.id = ?
      GROUP BY v.id
      `,
      [vendorId],
    );

    if (vendorRows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    const vendor = vendorRows[0];

    const [products] = await db.query(
      `
      SELECT
        id,
        category_id,
        name,
        price,
        description,
        image_urls,
        isFeatured,
        stock,
        created_at,
        updated_at
      FROM Products
      WHERE vendor_id = ?
      `,
      [vendorId],
    );

    res.json({
      id: vendor.id,
      store_name: vendor.store_name,
      email: vendor.email, // Add this line
      description: vendor.description,
      country: vendor.country,
      city: vendor.city,
      district: vendor.district,
      logo_url: vendor.logo_url,
      license_url: vendor.license_url,
      isVerified: vendor.isVerified,
      status: vendor.status,
      product_count: vendor.product_count || 0,
      averageRating: parseFloat(vendor.averageRating) || 0,
      totalReviews: vendor.totalReviews || 0,
      created_at: vendor.created_at,
      updated_at: vendor.updated_at,
      products: products.map((p) => ({
        id: p.id,
        category_id: p.category_id,
        name: p.name,
        price: parseFloat(p.price),
        description: p.description,
        image_urls: safeParseJSON(p.image_urls),
        isFeatured: !!p.isFeatured,
        stock: p.stock,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    });
  } catch (err) {
    console.error(`Error fetching vendor details ${vendorId}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
