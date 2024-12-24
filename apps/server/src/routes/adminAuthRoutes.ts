import { Router } from 'express';
import AdminAuthController from '../controllers/adminAuthController';
import { adminAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const adminAuthController = new AdminAuthController();

router.post('/register', adminAuthMiddleware, adminAuthController.register.bind(adminAuthController));
router.post('/login', adminAuthController.login.bind(adminAuthController));

export default router;
