import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ReqUser } from "../models/reqUser";
import { UserService } from "../services/userService";
import { AdminService } from "../services/adminService";
import { CustomException } from "../errors/CustomException";

const userService = new UserService();
const adminService = new AdminService();

const userAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;

    if (!token) {
        return next(new CustomException(401, "No token provided", "NOT_AUTHORIZED"));
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;

        const exists = await userService.getUserById(req.user.id);
        if (!exists || exists.role !== "user") {
            return next(new CustomException(401, "User not found", "NOT_AUTHORIZED"));
        }

        next();
    } catch (error) {
        return next(new CustomException(401, "Invalid or expired token", "NOT_AUTHORIZED"));
    }
};

const adminAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;

    if (!token) {
        return next(new CustomException(401, "No token provided", "NOT_AUTHORIZED"));
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;

        if (req?.user?.role !== "admin" && req?.user?.role !== "panel") {
            return next(new CustomException(401, "User is not authorized to access this route", "NOT_AUTHORIZED"));
        }

        const exists = await adminService.getAdminById(req.user.id);
        if (!exists) {
            return next(new CustomException(401, "User not found", "NOT_AUTHORIZED"));
        }

        next();
    } catch (error) {
        if (error instanceof CustomException) {
            return next(new CustomException(401, error.message, "NOT_AUTHORIZED"));
        } else {
            return next(new CustomException(401, "Invalid or expired token", "NOT_AUTHORIZED"));
        }
    }
};

export { userAuthMiddleware, adminAuthMiddleware };
