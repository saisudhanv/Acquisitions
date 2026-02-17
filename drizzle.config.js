import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || '';

export default {
    schema: './src/models/*.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: databaseUrl,
    }
};