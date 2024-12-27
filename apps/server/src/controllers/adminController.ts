import { Request, Response, NextFunction } from "express";
import AdminService from "../services/adminService";


class AdminController {
    private adminService = new AdminService();

    async getAllAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const admins = await this.adminService.getAllAdmins();
            res.json(admins);
        } catch (error) {
            next(error);
        }
    }

    async getAdminById(req: Request, res: Response, next: NextFunction) {
        try {
            const admin = await this.adminService.getAdminById(req.params.adminId);
            if (!admin) {
                res.status(404).json({ message: "Admin not found" });
            } else {
                res.json(admin);
            }
        } catch (error) {
            next(error);
        }
    }

    // async updateAdmin(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         await this.adminService.updateAdmin(req.params.adminId, req.body);
    //         res.status(204).send();
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // async deleteAdmin(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         await this.adminService.deleteAdmin(req.params.adminId);
    //         res.status(204).send();
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}

export default AdminController;
