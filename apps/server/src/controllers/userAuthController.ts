import { Request, Response, NextFunction } from "express";
import AuthService from "../services/authService";
import { CustomException } from "../errors/CustomException";

class userAuthController {
    private authService = new AuthService();

    async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await this.authService.register(req.body);
            res.json({ message: "User created successfully" });
        } catch (error: any) {
            next(new CustomException(400, "USER_CREATION_FAILED", error.message));
        }
    }

    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const token = await this.authService.login(
                req.body.email,
                req.body.password
            );
            // Set the token in a cookie
            res.cookie("auth_token", token, {
                httpOnly: true, // Ensures the cookie is not accessible via JavaScript (for security)
                secure: process.env.NODE_ENV === "production", // Ensure the cookie is sent over HTTPS in production
                maxAge: 24 * 60 * 60 * 1000, // Optional: Set cookie expiration time (e.g., 1 day)
                sameSite: "strict", // Optional: Controls the cross-site cookie behavior (could be 'Lax' or 'None' depending on your needs)
            });
            res.status(200).json({ token });
        } catch (error: any) {
            next(new CustomException(400, "LOGIN_FAILED", error.message));
        }
    }
}

export default userAuthController;
