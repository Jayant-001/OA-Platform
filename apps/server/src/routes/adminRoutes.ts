import { Router } from 'express';
import AdminController from '../controllers/adminController';
import {UserController} from '../controllers/userController';

const router = Router();
const adminController = new AdminController();
const userController = new UserController();


//router.get('/:adminId', adminController.getAdminById.bind(adminController));
//router.post('/', adminController.createAdmin.bind(adminController));
//router.put('/:adminId', adminController.updateAdmin.bind(adminController));
//router.delete('/:adminId', adminController.deleteAdmin.bind(adminController));

export default router;
