import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpException } from "./errorHandler";
import { ReqUser } from "../models/reqUser";

const userAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
        throw new HttpException(401, "NOT_AUTHORIZED", "No token provided");
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;
        next();
    } catch (error) {
        throw new HttpException(
            401,
            "NOT_AUTHORIZED",
            "Invalid or expired token"
        );
    }
};

const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;

    if (!token) {
        throw new HttpException(401, "NOT_AUTHORIZED", "No token provided");
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;
        if (req?.user?.role !== 'admin' && req?.user?.role !== 'panel') {
            throw new HttpException(401, "NOT_AUTHORIZED", "User is not authorized to access this route");
        }

        next();
    }
    catch (error) {
        if (error instanceof HttpException) {
            throw new HttpException(
                401,
                "NOT_AUTHORIZED",
                error.message
            );
        } else {
            throw new HttpException(
                401,
                "NOT_AUTHORIZED",
                "Invalid or expired token"
            );
        }
    }
};


export { userAuthMiddleware, adminAuthMiddleware };
