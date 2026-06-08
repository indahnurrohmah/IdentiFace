require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

//  IMPORT CONFIG & DATABASE 
const pool = require('./config/db'); 
const supabaseClient = require('./config/supabase');

// IMPORT MIDDLEWARE 
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// IMPORT ROUTES 
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const studentRoutes = require('./routes/studentRoutes'); 
const lecturerRoutes = require('./routes/lecturerRoutes');

const app = express();

// GLOBAL MIDDLEWARE 
app.use(cors({ 
    origin: ['http://localhost:5173', 
        'https://identi-face.vercel.app',
        'https://identiface-backend-api-f3bse6gycfacb7au.southeastasia-01.azurewebsites.net'
    ],
    credentials: true            
}));

// Parse JSON to accept request bodies from the frontend
app.use(express.json());
app.use(cookieParser());

// Apply standard rate limiting (100 req/15min) to all API routes
app.use(apiLimiter); 

//ENDPOINTS & ROUTES ---
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'IdentiFace Backend is running smoothly!' });
});

// Mount the auth routes (Apply the stricter authLimiter here)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes); // Mounted the admin routes
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);

// FALLBACK & ERROR HANDLING -
app.use(notFoundHandler); 
// Catch global server errors (including Multer errors from uploadMiddleware)
app.use(errorHandler); 


// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
