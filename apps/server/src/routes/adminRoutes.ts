import { Router } from 'express';
import AdminController from '../controllers/adminController';
import {UserController} from '../controllers/userController';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
const adminController = new AdminController();
const userController = new UserController();

router.get('/users', asyncWrapper(userController.getAllUsers.bind(userController)));
router.get('/users/:userId', asyncWrapper(userController.getUserById.bind(userController)));
router.get('/', asyncWrapper(adminController.getAllAdmins.bind(adminController)));
router.get('/:adminId', asyncWrapper(adminController.getAdminById.bind(adminController)));
//router.post('/', adminController.createAdmin.bind(adminController));
//router.put('/:adminId', adminController.updateAdmin.bind(adminController));
//router.delete('/:adminId', adminController.deleteAdmin.bind(adminController));

export default router;
