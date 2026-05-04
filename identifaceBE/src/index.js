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

// API routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});