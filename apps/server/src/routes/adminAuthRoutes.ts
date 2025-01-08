import { Router } from 'express';
import AdminAuthController from '../controllers/adminAuthController';
import { adminAuthMiddleware } from '../middleware/authMiddleware';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
const adminAuthController = new AdminAuthController();

router.post('/register', adminAuthMiddleware, asyncWrapper(adminAuthController.register.bind(adminAuthController)));
router.post('/login', asyncWrapper(adminAuthController.login.bind(adminAuthController)));

export default router;
