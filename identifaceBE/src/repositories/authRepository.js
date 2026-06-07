const pool = require('../config/db');

/**
 * Repository handling all database operations for Accounts & Authentication
 */
const authRepository = {
    /**
     * Find an account by its email
     * @param {string} email 
     * @returns {Promise<object|null>}
     */
    findByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM akun WHERE email = $1', [email]);
        return result.rows[0] || null;
    },

};

module.exports = authRepository;