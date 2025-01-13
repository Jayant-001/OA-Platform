/// <reference path="./types/express.d.ts" />

require('express-async-errors');

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
import { userAuthorizationMiddleware } from "./middleware/userAuthorizationMiddleware";
import { adminAuthorizationMiddleware } from "./middleware/adminAuthorizationMiddleware";
import { authenticationMiddleware } from "./middleware/authenticationMiddleware";
import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import commonRoutes from "./routes/commonRoutes";
import OutputQueueService from "./services/outputQueueService";


const outputQueueService = new OutputQueueService();
outputQueueService.start();

const app = express();
const PORT = process.env.PORT;
const corsOptions = {
    origin: 'http://localhost:5173',  // Allow the client to access the server
    credentials: true,  // Allow cookies to be sent/received
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const morganFormat = ":method :url :status :response-time ms";
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0],
                    url: message.split(" ")[1],
                    status: message.split(" ")[2],
                    responseTime: message.split(" ")[3],
                };
                console.log(JSON.stringify(logObject));
            },
        },
    })
);

app.use("/auth/users", userAuthRoutes); // User auth
app.use("/api/users", authenticationMiddleware, userAuthorizationMiddleware, userRoutes);
app.use("/api/users/contests", authenticationMiddleware, userAuthorizationMiddleware, userContestRoutes); // Contest routes for users

app.use("/auth/admins", adminAuthRoutes);
app.use("/api", authenticationMiddleware,commonRoutes);
app.use("/api/admins/contests", authenticationMiddleware, adminAuthorizationMiddleware, adminContestRoutes); // Contest routes for admins
app.use("/api/admins/problems", authenticationMiddleware, adminAuthorizationMiddleware, adminProblemRoutes); // Problem routes for admins
app.use("/api/admins/tags", authenticationMiddleware, adminAuthorizationMiddleware, tagRoutes); // Tag routes for admins
app.use("/api/admins", authenticationMiddleware, adminAuthorizationMiddleware, adminRoutes);

app.get("/", (req, res) => {
    return res.send("hello world  ^_^");
});

// Global error handling middleware
app.use(errorHandler);

app.listen(PORT, () =>
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
);


export default app;
