import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/adminService";
import { CustomException } from "../errors/CustomException";

const adminService = new AdminService();

const adminAuthorizationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
   
    if (req.user?.role !== "admin" && req.user?.role !== "panel") {
        return next(new CustomException(403, "FORBIDDEN","User is not authorized to access this route"));
    }

    const exists = await adminService.getAdminById(req.user.id);
    if (!exists) {
        return next(new CustomException(404, "NOT_FOUND", "User not found"));
    }

    next();
};

export { adminAuthorizationMiddleware };
