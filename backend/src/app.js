import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'BudgetFlow AI Backend is running' });
});

export { app };
