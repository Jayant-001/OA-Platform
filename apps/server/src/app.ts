/// <reference path="./types/express.d.ts" />
import express from "express";
import userRoutes from "./routes/userRoutes";
import userAuthRoutes from "./routes/userAuthRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRoutes from "./routes/adminRoutes";
import userContestRoutes from "./routes/userContestRoutes";
import adminContestRoutes from "./routes/adminContestRoutes";
import adminProblemRoutes from "./routes/adminProblemRoutes";
import tagRoutes from "./routes/tagRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { userAuthMiddleware, adminAuthMiddleware } from "./middleware/authMiddleware";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/auth/users", userAuthRoutes); // User auth
app.use("/api/users", userAuthMiddleware, userRoutes);
app.use("/api/users/contests", userAuthMiddleware, userContestRoutes); // Contest routes for users

app.use("/auth/admins", adminAuthRoutes); 
app.use("/api/admins/contests", adminAuthMiddleware, adminContestRoutes); // Contest routes for admins
app.use("/api/admins/problems", adminAuthMiddleware, adminProblemRoutes); // Problem routes for admins
app.use("/api/admins/tags", adminAuthMiddleware, tagRoutes); // Tag routes for admins
app.use("/api/admins", adminAuthMiddleware, adminRoutes);


app.get("/", (req, res) => {
    return res.send("hello world  ^_^");
});

// Global error handling middleware
app.use(errorHandler);

app.listen(PORT, () =>
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
);

export default app;
