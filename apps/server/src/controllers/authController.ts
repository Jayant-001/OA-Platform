import { Request, Response } from "express";
import AuthService from "../services/authService";

class AuthController {
    private authService = new AuthService();

    async register(req: Request, res: Response): Promise<void> {
        try {
            await this.authService.register(req.body);
            res.json({ message: "User created successfully" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const token = await this.authService.login(
                req.body.email,
                req.body.password
            );
            res.status(200).json({ token });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default AuthController;
