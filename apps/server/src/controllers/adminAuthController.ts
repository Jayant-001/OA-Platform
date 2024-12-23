import { Request, Response, NextFunction } from "express";
import AuthService from "../services/authService";

class AdminAuthController {
    private authService = new AuthService();

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            if (req?.user?.role !== 'admin') {
                return res.status(403).json({ message: "Not authorized to register an admin" });
            }
            const admin = await this.authService.registerAdmin(req.body);
            res.status(201).json(admin);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const token = await this.authService.loginAdmin(req.body.email, req.body.password);
            res.json({ token });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminAuthController;
