/// <reference path="./types/express.d.ts" />
import express from "express";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import problemRoutes from "./routes/problemRoutes";
import { errorHandler } from "./middleware/errorHandler";
import authMiddleware from "./middleware/authMiddleware";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/api", authMiddleware, userRoutes);
app.use("/api", authMiddleware, problemRoutes);
app.use("/auth", authRoutes);
app.use("/auth", adminAuthRoutes);

app.get("/", (req, res) => {
    return res.send("hello world  ^_^");
});

// Global error handling middleware
app.use(errorHandler);

app.listen(PORT, () =>
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
);
