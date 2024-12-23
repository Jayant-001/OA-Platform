import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:userId', userController.getUserById.bind(userController));
router.put('/:userId', userController.updateUser.bind(userController));
router.delete('/:userId', userController.deleteUser.bind(userController));

export default router;
