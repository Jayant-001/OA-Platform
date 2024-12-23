import { AdminRepository } from '../repositories/adminRepository';
import { Admin } from '../models/admin';
import { HttpException } from '../middleware/errorHandler';

export class AdminService {
    private adminRepository = new AdminRepository();

    async getAllAdmins(): Promise<Admin[]> {
        return this.adminRepository.findAll();
    }

    async getAdminById(adminId: string): Promise<Admin | null> {
        return this.adminRepository.findById(adminId);
    }

    async createAdmin(admin: Omit<Admin, 'id'>): Promise<Admin> {
        return this.adminRepository.create(admin);
    }

    async updateAdmin(adminId: string, adminData: Partial<Admin>): Promise<void> {
        const isExists = await this.adminRepository.findById(adminId);
        if (isExists === null) {
            throw new HttpException(404, "ADMIN_NOT_FOUND", "Admin not found");
        }
        return this.adminRepository.update(adminId, adminData);
    }

    async deleteAdmin(adminId: string): Promise<void> {
        const isExists = await this.adminRepository.findById(adminId);
        if (isExists === null) {
            throw new HttpException(404, "ADMIN_NOT_FOUND", "Admin not found");
        }
        return this.adminRepository.delete(adminId);
    }
}

export default AdminService;
