import mysql from 'mysql2';

const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

// Test the connection
(async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
  } catch (err) {
    console.error(err);
  }
})();

export default db;
