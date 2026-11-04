import mysql from 'mysql2';

// Accept either a single connection string (DATABASE_URL / MYSQL_URL, as provided
// by Railway and most hosts) or individual DB_* variables.
export const getDbConfig = (extra = {}) => {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (url) {
    return { uri: url, ...extra };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...extra,
  };
};

const db = mysql.createPool(getDbConfig({ waitForConnections: true, connectionLimit: 10 })).promise();

// Test the connection
(async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Successfully connected to the database.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

export default db;
