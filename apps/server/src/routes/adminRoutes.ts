import { Router } from 'express';
import AdminController from '../controllers/adminController';
import {UserController} from '../controllers/userController';

const router = Router();
const adminController = new AdminController();

const userController = new UserController();

router.get('/users', userController.getAllUsers.bind(userController));
router.get('/users/:userId', userController.getUserById.bind(userController));
router.get('/', adminController.getAllAdmins.bind(adminController));
router.get('/:adminId', adminController.getAdminById.bind(adminController));
router.post('/', adminController.createAdmin.bind(adminController));
router.put('/:adminId', adminController.updateAdmin.bind(adminController));
router.delete('/:adminId', adminController.deleteAdmin.bind(adminController));

export default router;
