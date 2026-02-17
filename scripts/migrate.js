import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const isNeonLocal = databaseUrl.includes('neon-local');
const connectionString = isNeonLocal
  ? databaseUrl.replace(/([?&])sslmode=[^&]+(&|$)/i, '$1').replace(/[?&]$/, '')
  : databaseUrl;

const pool = new Pool({
  connectionString,
  ssl: isNeonLocal ? false : undefined
});
const db = drizzle(pool);

try {
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations applied successfully');
} finally {
  await pool.end();
}
