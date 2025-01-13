import { Router } from 'express';
import UserAuthController from '../controllers/userAuthController';

const router = Router();
const userAuthController = new UserAuthController();

router.post(
    '/register',
    userAuthController.register.bind(userAuthController)
);

router.post(
    '/login',
    userAuthController.login.bind(userAuthController)
);



export default router;
