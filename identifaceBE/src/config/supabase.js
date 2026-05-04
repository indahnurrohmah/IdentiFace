require('dotenv').config();
const { Pool } = require('pg');

// Initialize the direct connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Immediately test the direct connection and log it to the console
(async () => {
    try {
        // We attempt to connect a client from the pool
        const client = await pool.connect();
        console.log('✅ Successfully connected to Supabase via Direct PostgreSQL Connection!');
        
        // Always release the client back to the pool when done testing
        client.release();
    } catch (err) {
        console.error('❌ Failed to connect directly to Supabase:', err.message);
    }
})();

module.exports = pool;