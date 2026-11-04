// Loads database/schema.sql and database/seed.sql into the database the env points to.
// Usage: npm run db:setup            (refuses if the database already has users)
//        npm run db:setup -- --reset (drops all tables and reloads demo data)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { getDbConfig } from '../server/config/db.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const reset = process.argv.includes('--reset');

const main = async () => {
  const connection = await mysql.createConnection(getDbConfig({ multipleStatements: true }));
  try {
    const [[{ db }]] = await connection.query('SELECT DATABASE() AS db');
    console.log(`Connected to database "${db}".`);

    const [tables] = await connection.query("SHOW TABLES LIKE 'Users'");
    if (tables.length > 0 && !reset) {
      const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM Users');
      if (count > 0) {
        console.error(
          `Database already has ${count} users. Re-run with --reset to DROP all tables and reload demo data.`,
        );
        process.exitCode = 1;
        return;
      }
    }

    for (const file of ['schema.sql', 'seed.sql']) {
      const sql = fs.readFileSync(path.join(root, 'database', file), 'utf8');
      await connection.query(sql);
      console.log(`Applied database/${file}`);
    }

    const [[counts]] = await connection.query(
      'SELECT (SELECT COUNT(*) FROM Users) AS users, (SELECT COUNT(*) FROM Vendors) AS vendors, (SELECT COUNT(*) FROM Products) AS products',
    );
    console.log(`Done: ${counts.users} users, ${counts.vendors} vendors, ${counts.products} products.`);
  } finally {
    await connection.end();
  }
};

main()
  .then(() => process.exit())
  .catch((err) => {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  });
