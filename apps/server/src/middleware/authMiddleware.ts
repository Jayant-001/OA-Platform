import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpException } from "./errorHandler";
import { ReqUser } from "../models/reqUser";
import { UserService } from "../services/userService";
import { AdminService } from "../services/adminService";

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
        return next(new HttpException(401, "NOT_AUTHORIZED", "No token provided"));
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;

        const exists = await userService.getUserById(req.user.id);
        if (!exists || exists.role !== "user") {
            return next(new HttpException(401, "NOT_AUTHORIZED", "User not found"));
        }

        next();
    } catch (error) {
        return next(new HttpException(
            401,
            "NOT_AUTHORIZED",
            "Invalid or expired token"
        ));
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
        return next(new HttpException(401, "NOT_AUTHORIZED", "No token provided"));
    }

    try {
        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;

        if (req?.user?.role !== "admin" && req?.user?.role !== "panel") {
            return next(new HttpException(
                401,
                "NOT_AUTHORIZED",
                "User is not authorized to access this route"
            ));
        }
        
        const exists = await adminService.getAdminById(req.user.id);
        if (!exists) {
            return next(new HttpException(401, "NOT_AUTHORIZED", "User not found"));
        }

        next();
    } catch (error) {
        if (error instanceof HttpException) {
            return next(new HttpException(401, "NOT_AUTHORIZED", error.message));
        } else {
            return next(new HttpException(
                401,
                "NOT_AUTHORIZED",
                "Invalid or expired token"
            ));
        }
    }
};

export { userAuthMiddleware, adminAuthMiddleware };
