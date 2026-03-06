import express from "express";
import cors from "cors";

import budgetRoutes from "./routes/budgetRoute.js";
import anomalyRoutes from "./routes/anomalyRoute.js";
import predictionRoutes from "./routes/predictionRoute.js";
import { errorHandler } from "./middleware/errorhandler.js";

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/budget",     budgetRoutes);
app.use("/api/anomaly",    anomalyRoutes);
app.use("/api/prediction", predictionRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'BudgetFlow AI Backend is running' });
});
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'BudgetFlow API is running' });
});

// Global Error Handler
app.use(errorHandler);

export { app };