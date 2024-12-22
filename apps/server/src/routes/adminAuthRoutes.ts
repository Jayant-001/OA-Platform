import { Router } from "express";
import AdminAuthController from "../controllers/adminAuthController";

const router = Router();
const adminAuthController = new AdminAuthController();

router.post(
    "/admin/login",
    adminAuthController.login.bind(adminAuthController)
);

router.post(
    "/admin/register",
    adminAuthController.register.bind(adminAuthController)
);

export default router;
