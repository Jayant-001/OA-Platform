import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ReqUser } from "../models/reqUser";
import { CustomException } from "../errors/CustomException";

const authenticationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;

    if (!token) {
        return next(new CustomException(401, "NOT_AUTHORIZED","No token provided"));
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = jwt.verify(token, secret) as ReqUser;
    req.user = decoded; 
    if (req.user === null || req.user === undefined) {
        return next(new CustomException(404, "NOT_FOUND", "User Not Found"));   
    }
    next();
   
};

export { authenticationMiddleware };
