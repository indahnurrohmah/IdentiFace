require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Kita mengambil URL dan API Key dari environment variables
const supabaseUrl = process.env.SUPABASE_URL;
// Gunakan Service Role Key agar Node.js memiliki hak akses penuh (bypass RLS) untuk upload file
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Peringatan: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diatur di file .env!');
}

// Inisialisasi client Supabase
const supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false // Matikan session karena kita hanya pakai ini untuk Storage, bukan Auth
    }
});

module.exports = supabaseClient;