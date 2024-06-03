import express from "express";
import authRoutes from "./routes/authRoute";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

export default app;
