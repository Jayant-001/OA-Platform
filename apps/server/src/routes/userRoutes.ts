import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

router.put('/:userId', userController.updateUser.bind(userController));
router.delete('/:userId', userController.deleteUser.bind(userController));

export default router;
