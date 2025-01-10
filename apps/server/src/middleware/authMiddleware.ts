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

        const secret = process.env.JWT_SECRET || "your_jwt_secret";
        const decoded = jwt.verify(token, secret) as ReqUser;
        req.user = decoded;

        const exists = await userService.getUserById(req.user.id);
        if (!exists || exists.role !== "user") {
            return next(new CustomException(401, "User not found", "NOT_AUTHORIZED"));
        }

        next();
   
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
   
};

export { userAuthMiddleware, adminAuthMiddleware };
