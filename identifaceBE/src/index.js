require('dotenv').config();
const express = require('express');
const cors = require('cors');

const supabase = require('./config/supabase');

const app = express();

app.use(cors());
app.use(express.json());

// A simple health check to ensure the Express server is running
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'IdentiFace Backend is running!' });
});

// API ROUTES

// Import the auth routes
const authRoutes = require('./routes/authRoutes');

//  Mount the auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});