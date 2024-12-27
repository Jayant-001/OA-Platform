import { UserRepository } from '../repositories/userRepository';
import { Admin } from '../models/admin';
import { HttpException } from '../middleware/errorHandler';

export class AdminService {
    private userRepository = new UserRepository();

    async getAllAdmins(): Promise<Admin[]> {
        return this.userRepository.findAllAdmins();
    }

    async getAdminById(adminId: string): Promise<Admin | null> {
        return this.userRepository.findAdminById(adminId);
    }

  
}

export default AdminService;
