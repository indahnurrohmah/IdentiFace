const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AI_BASE_URL = process.env.AI_BASE_URL || 'http://127.0.0.1:8000';
const AI_TIMEOUT = parseInt(process.env.AI_TIMEOUT, 10) || 15000;

console.log('[aiService] AI_BASE_URL:', AI_BASE_URL);
console.log('[aiService] AI_TIMEOUT:', AI_TIMEOUT);
/**
 * Build a configured axios instance for the AI service
 */
const aiClient = axios.create({
    baseURL: AI_BASE_URL,
    timeout: AI_TIMEOUT
});

/**
 * Register a face for a given NIM.
 * Forwards the uploaded image file to the AI service.
 *
 * @param {string} nim - Student NIM
 * @param {string} filePath - Absolute path to the uploaded image on disk
 * @returns {Promise<{ success: boolean, message: string, raw: object }>}
 */
const registerFace = async (nim, filePath) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: _getMimeType(filePath)
    });
    
    try {
        const response = await aiClient.post(
            `/register-face/${nim}`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Accept': 'application/json'
                }
            }
        );

        // AI returns: { status: "ok", nim: "...", pesan: "Wajah berhasil dideteksi" }
        const data = response.data;
        const isSuccess = data.status === 'ok';

        return {
            success: isSuccess,
            message: data.pesan || (isSuccess ? 'Wajah berhasil diregistrasi.' : 'Registrasi wajah gagal.'),
            raw: data
        };
    } catch (err) {
        return _handleAiError(err, 'register-face');
    }
};

/**
 * Verify a face against the database, including GPS validation.
 * Used during attendance scanning.
 *
 * @param {string} filePath - Absolute path to the uploaded image on disk
 * @param {number} latitude - User's current latitude
 * @param {number} longitude - User's current longitude
 * @returns {Promise<{ success: boolean, message: string, confidence?: number, raw: object }>}
 */
const verifyFace = async (filePath, latitude, longitude) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: _getMimeType(filePath)
    });
    
    // Add the required GPS coordinates to the form data
    form.append('latitude', latitude.toString());
    form.append('longitude', longitude.toString());

    try {
        // Note: The FastAPI endpoint is just /verify-face, it doesn't take NIM in the URL
        const response = await aiClient.post(
            `/verify-face`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Accept': 'application/json'
                }
            }
        );

        const data = response.data;
        // The Python API returns { match: True/False, status: "...", pesan: "..." }
        const isMatch = data.match === true;

        return {
            success: isMatch,
            message: data.pesan || (isMatch ? 'Wajah terverifikasi.' : 'Wajah tidak cocok.'),
            similarity: data.similarity || null, // The API returns 'similarity', not 'confidence'
            nim: data.nim || null, // If matched, the API returns the identified NIM
            raw: data
        };
    } catch (err) {
        return _handleAiError(err, 'verify-face');
    }
};

/**
 * Delete a registered face from the AI service.
 * Called when re-registering or deleting a student.
 *
 * @param {string} nim - Student NIM
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const deleteFace = async (nim) => {
    try {
        const response = await aiClient.delete(`/delete-face/${nim}`, {
            headers: { 'Accept': 'application/json' }
        });

        const data = response.data;
        return {
            success: data.status === 'ok',
            message: data.pesan || 'Data wajah dihapus.',
            raw: data
        };
    } catch (err) {
        // If 404 (face not found in AI), treat as success
        if (err.response && err.response.status === 404) {
            return { success: true, message: 'Data wajah tidak ditemukan di AI service (sudah dihapus atau belum terdaftar).' };
        }
        return _handleAiError(err, 'delete-face');
    }
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

function _getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    };
    return mimeMap[ext] || 'image/jpeg';
}

function _handleAiError(err, operation) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        console.error(`[AI Service] ${operation}: AI service tidak dapat dijangkau di ${AI_BASE_URL}`);
        return {
            success: false,
            message: 'AI service tidak dapat dijangkau. Silakan coba beberapa saat lagi.',
            raw: null,
            serviceUnavailable: true
        };
    }

    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.error(`[AI Service] ${operation}: Request timeout setelah ${AI_TIMEOUT}ms`);
        return {
            success: false,
            message: 'AI service tidak merespons tepat waktu. Silakan coba lagi.',
            raw: null,
            timeout: true
        };
    }

    // AI returned an error response (4xx/5xx)
    if (err.response) {
        const data = err.response.data;
        console.error(`[AI Service] ${operation}: HTTP ${err.response.status}`, data);
        return {
            success: false,
            message: data?.pesan || data?.detail || data?.message || 'AI service mengembalikan error.',
            raw: data
        };
    }

    console.error(`[AI Service] ${operation}: Unknown error`, err.message);
    return {
        success: false,
        message: 'Terjadi kesalahan pada AI service.',
        raw: null
    };
}

module.exports = { registerFace, verifyFace, deleteFace };
