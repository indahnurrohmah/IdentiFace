// Fungsi pembantu untuk memformat tanggal dan waktu
const getTimestamp = () => new Date().toISOString();

const logger = {
    info: (message) => {
        console.log(`\x1b[36m[INFO]\x1b[0m [${getTimestamp()}] ${message}`);
    },
    success: (message) => {
        console.log(`\x1b[32m[SUCCESS]\x1b[0m [${getTimestamp()}] ${message}`);
    },
    warn: (message) => {
        console.log(`\x1b[33m[WARN]\x1b[0m [${getTimestamp()}] ${message}`);
    },
    error: (message, errorObj = '') => {
        console.error(`\x1b[31m[ERROR]\x1b[0m [${getTimestamp()}] ${message}`, errorObj);
    }
};

module.exports = logger;