import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const officerId = process.env.ADMIN_OFFICER_ID;

if (!uri || !email || !password || !officerId) {
    console.error("FAILURE: Missing required environment variables.");
    console.error("Ensure MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_OFFICER_ID are set.");
    process.exit(1);
}

const createAdmin = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(uri);
        
        const existingUser = await User.findOne({ 
            $or: [{ email }, { officerId }]
        });
        
        if (existingUser) {
            console.log("SUCCESS: Admin user with this email or officer ID already exists. Skipping creation.");
            await mongoose.disconnect();
            process.exit(0);
        }
        
        const adminUser = new User({
            fullName: "System Admin",
            email,
            password,
            officerId,
            role: "admin",
            department: "All",
            state: "All"
        });
        
        await adminUser.save();
        console.log("SUCCESS: Admin user created successfully.");
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("FAILURE: Could not create admin user.");
        console.error("Detailed Reason:", error.message);
        process.exit(1);
    }
};

createAdmin();
