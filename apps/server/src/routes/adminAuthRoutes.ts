import { Router } from 'express';
import AdminAuthController from '../controllers/adminAuthController';
import { adminAuthorizationMiddleware } from "../middleware/adminAuthorizationMiddleware";
const router = Router();
const adminAuthController = new AdminAuthController();

router.post('/register', adminAuthorizationMiddleware, adminAuthController.register.bind(adminAuthController));
router.post('/login', adminAuthController.login.bind(adminAuthController));

export default router;
