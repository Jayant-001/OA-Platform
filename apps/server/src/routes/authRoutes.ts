import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
const authController = new AuthController();

router.post('/register', asyncHandler(authController.register.bind(authController)));

// ...existing code...

export default router;