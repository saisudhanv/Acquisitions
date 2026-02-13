// database.js - Database configuration for both Postgres and Neon Serverless drivers
const { neon, neonConfig } = require('@neondatabase/serverless');

// Configure Neon for development with Neon Local
if (process.env.NODE_ENV === 'development') {
    // Configure for Neon Local (HTTP-based communication)
    neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
}

// Database connection configuration
const dbConfig = {
    // Standard Postgres configuration (works with both Neon Local and Neon Cloud)
    postgres: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
    
    // Neon Serverless configuration
    neonServerless: process.env.DATABASE_URL,
};

// Create Neon serverless connection (can be used alongside standard Postgres)
const sql = neon(process.env.DATABASE_URL);

module.exports = {
    dbConfig,
    sql,
    neonConfig
};