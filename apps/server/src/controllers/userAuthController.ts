import { Request, Response, NextFunction } from "express";
import AuthService from "../services/authService";

class userAuthController {
    private authService = new AuthService();

    async register(
        req: Request,
        res: Response): Promise<void> {
            await this.authService.register(req.body,'user');
            res.json({ message: "User created successfully" });
       
    }

    async login(
        req: Request,
        res: Response
    ): Promise<void> {
            const token = await this.authService.login(
                req.body.email,
                req.body.password
            );
            // Set the token in a cookie
            res.cookie("auth_token", token, {
                httpOnly: true, // Ensures the cookie is not accessible via JavaScript (for security)
                secure: true, // Ensure the cookie is sent over HTTPS in production
                maxAge: 24 * 60 * 60 * 1000, // Optional: Set cookie expiration time (e.g., 1 day)
                sameSite: "none", // Optional: Controls the cross-site cookie behavior (could be 'Lax' or 'None' depending on your needs)
            });
            res.status(200).json({ token });
      
    }
}

export default userAuthController;
