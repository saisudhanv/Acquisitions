import 'dotenv/config';

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

let sql;
let db;

const databaseUrl = process.env.DATABASE_URL || '';
const isNeonLocal = databaseUrl.includes('neon-local');

if (process.env.NODE_ENV === 'development' && isNeonLocal) {
    // Use WebSocket + Pool for neon-local in development
    neonConfig.webSocketConstructor = ws;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;

    const pool = new Pool({ connectionString: databaseUrl });
    db = drizzleServerless(pool);
    sql = pool;
} else {
    // Use HTTP for Neon cloud or non-local dev
    sql = neon(databaseUrl);
    db = drizzleHttp(sql);
}

export { db, sql };
export default { db, sql };