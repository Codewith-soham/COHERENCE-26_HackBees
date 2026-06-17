import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("FAILURE: MONGODB_URI environment variable is missing.");
    process.exit(1);
}

const checkAtlas = async () => {
    try {
        console.log("Attempting to connect to MongoDB Atlas...");
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // 5 seconds fail-fast for testing
        });
        
        console.log("SUCCESS: Reached MongoDB Atlas.");
        console.log(`Database Name: ${conn.connection.name}`);
        console.log(`Host: ${conn.connection.host}`);
        
        // Disconnect after successful check
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("FAILURE: Could not connect to MongoDB Atlas.");
        console.error("Detailed Reason:", error.message);
        process.exit(1);
    }
};

checkAtlas();
