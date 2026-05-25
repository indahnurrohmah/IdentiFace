require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// --- 1. IMPORT CONFIG & DATABASE ---
// Requiring db.js will automatically run your PostgreSQL connection test
const pool = require('./config/db'); 
const supabaseClient = require('./config/supabase');

// --- 2. IMPORT MIDDLEWARE ---
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// --- 3. IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const studentRoutes = require('./routes/studentRoutes'); 
const lecturerRoutes = require('./routes/lecturerRoutes');
const masterRoutes = require('./routes/masterRoutes');

const app = express();

// --- 4. GLOBAL MIDDLEWARE ---
app.use(cors({
    origin: 'http://localhost:5173', // WAJIB sama persis dengan URL Frontend-mu (tanpa garis miring di akhir)
    credentials: true                // WAJIB true agar mengizinkan pertukaran Cookie
}));
// Parse JSON to accept request bodies from the frontend
app.use(express.json());
app.use(cookieParser());

// Parse URL-encoded data (optional, useful for standard form submissions)
app.use(express.urlencoded({ extended: true })); 
// Apply standard rate limiting (100 req/15min) to all API routes
app.use(apiLimiter); 

// --- 5. ENDPOINTS & ROUTES ---
// A simple health check to ensure the Express server is running
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'IdentiFace Backend is running smoothly!' });
});

// Mount the auth routes (Apply the stricter authLimiter here)
app.use('/api/auth', authLimiter, authRoutes);

// Feature Routes (Uncomment these later once the route files are created)
app.use('/api/admin', adminRoutes); // Mounted the admin routes
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/admin/master', masterRoutes);

// --- 6. FALLBACK & ERROR HANDLING ---
// WARNING: These two middlewares MUST be placed at the very bottom!
// Catch non-existent routes (404 Error)
app.use(notFoundHandler); 
// Catch global server errors (including Multer errors from uploadMiddleware)
app.use(errorHandler); 


// --- 7. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});