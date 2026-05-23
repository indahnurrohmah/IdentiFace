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

    /**
     * Create a new user account (Pending verification)
     */
    createAccount: async ({ email, password, role, verificationToken, tokenExpiresAt }) => {
        const result = await pool.query(
            `INSERT INTO akun (email, password, role, verification_token, token_expires_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_akun, email, role, is_verified`,
            [email, password, role, verificationToken, tokenExpiresAt]
        );
        return result.rows[0];
    },

    /**
     * Verify user email and clear tokens
     */
    verifyAccount: async (email) => {
        const result = await pool.query(
            `UPDATE akun 
             SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL
             WHERE email = $1
             RETURNING id_akun, email, is_verified`,
            [email]
        );
        return result.rows[0] || null;
    }
};

module.exports = authRepository;