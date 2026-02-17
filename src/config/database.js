import 'dotenv/config';

import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNodePostgres } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let sql;
let db;

const databaseUrl = process.env.DATABASE_URL || '';
const isNeonLocal = databaseUrl.includes('neon-local');

if (process.env.NODE_ENV === 'development' && isNeonLocal) {
    // Use standard Postgres driver for neon-local in development
    const pool = new Pool({ connectionString: databaseUrl });
    db = drizzleNodePostgres(pool);
    sql = pool;
} else {
    // Use HTTP for Neon cloud or non-local dev
    sql = neon(databaseUrl);
    db = drizzleHttp(sql);
}

export { db, sql };
export default { db, sql };