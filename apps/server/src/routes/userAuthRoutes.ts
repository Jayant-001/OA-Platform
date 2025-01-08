import { Router } from 'express';
import { asyncWrapper } from '../utils/asyncWrapper';
import UserAuthController from '../controllers/userAuthController';

const router = Router();
const userAuthController = new UserAuthController();

router.post(
    '/register',
    asyncWrapper(userAuthController.register.bind(userAuthController))
);

router.post(
    '/login',
    asyncWrapper(userAuthController.login.bind(userAuthController))
);



export default router;
