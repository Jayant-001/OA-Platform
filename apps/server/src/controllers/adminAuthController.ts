import { Request, Response, NextFunction } from "express";
import AuthService from "../services/authService";
import { CustomException } from "../errors/CustomException";

class AdminAuthController {
    private authService = new AuthService();

    async register(req: Request, res: Response, next: NextFunction) {
            if (req?.user?.role !== 'admin') {
                return res.status(403).json({ message: "Not authorized to register an admin" });
            }
            const admin = await this.authService.register(req.body);
            res.status(201).json(admin);
       
    }

    async login(req: Request, res: Response, next: NextFunction) {
            const token = await this.authService.login(req.body.email, req.body.password);
            // Set the token in a cookie
            res.cookie('auth_token', token, {
                httpOnly: true,  // Ensures the cookie is not accessible via JavaScript (for security)
                secure: process.env.NODE_ENV === 'production',  // Ensure the cookie is sent over HTTPS in production
                maxAge: 24 * 60 * 60 * 1000,  // Optional: Set cookie expiration time (e.g., 1 day)
                sameSite: 'strict'  // Optiona: Controls the cross-site cookie behavior (could be 'Lax' or 'None' depending on your needs)
            });
            res.json({ token });
        
    }
}

export default AdminAuthController;
