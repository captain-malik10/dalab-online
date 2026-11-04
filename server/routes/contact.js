import express from 'express';
import db from '../config/db.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Contact form endpoint
router.post('/store-contact', async (req, res) => {
  const { storeId, senderName, senderEmail, message } = req.body;

  // Validate required fields
  if (!storeId || !senderName || !senderEmail || !message) {
    return res.status(400).json({
      error: 'Please provide storeId, senderName, senderEmail, and message',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Fetch vendor/store details from database
    const [vendors] = await db.query('SELECT store_name, email FROM Vendors WHERE id = ?', [
      storeId,
    ]);

    if (vendors.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const vendor = vendors[0];

    // Compose email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: vendor.email,
      subject: `New Contact Message from ${senderName} - ${vendor.store_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>From:</strong> ${senderName}</p>
          <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
          <p><strong>Store:</strong> ${vendor.store_name}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <h3 style="color: #555;">Message:</h3>
          <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        </div>
      `,
      replyTo: senderEmail, // So the vendor can reply directly
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Optionally: Save to database for record keeping
    try {
      await db.query(
        `INSERT INTO contact_messages (vendor_id, sender_name, sender_email, message, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [storeId, senderName, senderEmail, message],
      );
    } catch (dbError) {
      console.log(
        'Note: Contact message not saved to database (table may not exist):',
        dbError.message,
      );
      // Don't fail if DB save fails - email was sent successfully
    }

    res.json({
      message: 'Contact message sent successfully!',
      sentTo: vendor.email,
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      error: 'Failed to send contact message',
      details: error.message,
    });
  }
});

// Contact form endpoint for admin
router.post('/admin-contact', async (req, res) => {
  const { senderName, senderEmail, message } = req.body;

  // Validate required fields
  if (!senderName || !senderEmail || !message) {
    return res.status(400).json({
      error: 'Please provide senderName, senderEmail, and message',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Fetch the first admin user from database
    const [admins] = await db.query('SELECT name, email FROM Users WHERE role = "admin" LIMIT 1');

    if (admins.length === 0) {
      return res.status(404).json({ error: 'No admin found' });
    }

    const admin = admins[0];

    // Compose email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: `New Contact Message from ${senderName} - Ashal Online Market`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message from Website</h2>
          <p><strong>From:</strong> ${senderName}</p>
          <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <h3 style="color: #555;">Message:</h3>
          <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        </div>
      `,
      replyTo: senderEmail,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Optionally: Save to database for record keeping
    try {
      await db.query(
        `INSERT INTO contact_messages (sender_name, sender_email, message, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [senderName, senderEmail, message],
      );
    } catch (dbError) {
      console.log(
        'Note: Contact message not saved to database (table may not exist):',
        dbError.message,
      );
    }

    res.json({
      message: 'Contact message sent successfully!',
      sentTo: admin.email,
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      error: 'Failed to send contact message',
      details: error.message,
    });
  }
});

export default router;
