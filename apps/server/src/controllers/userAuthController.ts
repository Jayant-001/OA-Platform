import { Request, Response, NextFunction } from "express";
import AuthService from "../services/authService";
import { HttpException } from "../middleware/errorHandler";

class userAuthController {
    private authService = new AuthService();

    async register(req: Request, res: Response): Promise<void> {
        try {
            await this.authService.register(req.body);
            res.json({ message: "User created successfully" });
        } catch (error: any) {
            throw new HttpException(400, "USER_CREATION_FAILED", error.message);
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const token = await this.authService.login(req.body.email, req.body.password);
            res.status(200).json({ token });
        } catch (error: any) {
            throw new HttpException(400, "LOGIN_FAILED", error.message);
        }
    }
}

export default userAuthController;
