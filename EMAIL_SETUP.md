# Email Setup Guide for Contact Form

This guide will help you configure email functionality for the contact form in the store details page.

## Environment Variables Required

Add these variables to your `.env` file in the root directory:

### For Gmail (Recommended for Development)

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### For Outlook/Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### For Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-specific-password
```

## Setting up Gmail App Password (Recommended)

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Go to https://myaccount.google.com/apppasswords
5. Select "Mail" and "Other" (or your device)
6. Generate a password
7. Use this generated password as your `EMAIL_PASSWORD`

**Important:** Do NOT use your regular Gmail password. Use an app-specific password.

## Testing the Setup

1. Start your backend server:

   ```bash
   npm run server
   ```

2. Test the contact form by:
   - Navigate to any store details page
   - Go to the "Contact" tab
   - Fill in the form and submit

3. Check the store owner's email inbox for the message.

## Troubleshooting

### "Authentication failed" error

- Make sure you're using the correct app-specific password
- Verify that 2-Step Verification is enabled (for Gmail)
- Double-check your email and password

### "Connection timeout" error

- Check your internet connection
- Verify the email service name (gmail, hotmail, outlook, yahoo)
- Try a different email service

### Emails going to spam

- This is normal for first-time emails
- The store owner should check their spam folder
- Consider setting up SPF and DKIM records for production

## Database Table (Optional)

The contact route will try to save messages to a database table. If you want to enable this feature, create this table:

```sql
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES Vendors(id) ON DELETE CASCADE
);
```

**Note:** If this table doesn't exist, the email will still send successfully - it just won't be logged in the database.
