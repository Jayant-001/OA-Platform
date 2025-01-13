import { Request, Response, NextFunction } from "express";
import AdminService from "../services/adminService";
import { CustomException } from "../errors/CustomException";


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

    async getAdmin(req: Request, res: Response): Promise<void> {
        const admin = await this.adminService.getAdminById(req.user?.id as string);

        if (!admin) {
            throw CustomException.notFound("Admin not found");
        }
        const filteredAdmin = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        };

        res.json(filteredAdmin);
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
