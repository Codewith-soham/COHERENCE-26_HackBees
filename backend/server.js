import dotenv from 'dotenv';
import { app } from './src/app.js';
import connectDB from './src/config/dbConnection.js';
import { checkAIHealth } from './src/services/aiService.js';

dotenv.config({
    path: "./.env"
});

const port = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(port, async () => {
            console.log(`Server is running on port ${port}`);

            // Check Python AI service after server starts
            const aiOnline = await checkAIHealth();
            console.log(aiOnline
                ? '✅ Python AI service is online on port 8000'
                : '⚠️  Python AI service is OFFLINE — fallback mode active'
            );
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database", err);
    });