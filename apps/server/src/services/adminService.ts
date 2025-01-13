import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/user';

export class AdminService {
    private userRepository = new UserRepository();

    async getAllAdmins(): Promise<User[]> {
        return this.userRepository.findAllAdmins();
    }

    async getAdminById(adminId: string): Promise<User | null> {
        return this.userRepository.findAdminById(adminId);
    }

  
}

export default AdminService;
