import dotenv from 'dotenv';
dotenv.config();

const config = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-me-in-production',
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};

const requiredVars = ['MONGODB_URI'];
const missing = requiredVars.filter(v => !config[v]);

if (missing.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

export default config;
