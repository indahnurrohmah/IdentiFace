require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(process.env.NODE_ENV === 'production' && {
        ssl: { rejectUnauthorized: false }
    }),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected (Supabase)');
        client.release();
    } catch (err) {
        console.error('❌ PostgreSQL connection failed:', err.message);
    }
})();

module.exports = pool;