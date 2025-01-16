import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { AdminService } from "../services/adminService";

import { CustomException } from "../errors/CustomException";

class CommonController {
    private userService = new UserService();
    private adminService = new AdminService();

    async getUser(req: Request, res: Response): Promise<void> {

        if (req.user?.role === 'user')
        {
            const user = await this.userService.getUserById(req.user?.id as string);
            if (!user) {
                throw new CustomException(404, "USER_NOT_FOUND", "User not found");
            }
            const filteredUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                branch: user.branch,
                batch: user.batch,
            };

            res.json(filteredUser);
        }
        else
        {
            const user = await this.adminService.getAdminById(req.user?.id as string);
            if (!user) {
                throw new CustomException(404, "ADMIN_NOT_FOUND", "User not found");
            }
            const filteredUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            res.json(filteredUser);            
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        res.clearCookie('auth_token');
        res.status(200).json({ message: 'Logged out successfully' });
    }
    
}

export default CommonController;
