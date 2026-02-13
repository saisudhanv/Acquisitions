import 'dotenv/config';

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

let sql;
let db;

if(process.env.NODE_ENV === 'development') {
    // Use WebSocket for neon-local in development
    neonConfig.webSocketConstructor = ws;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzleServerless(pool);
    sql = pool;
} else {
    // Use HTTP for production (Neon cloud)
    sql = neon(process.env.DATABASE_URL);
    db = drizzleHttp(sql);
}

export { db, sql };
export default { db, sql };