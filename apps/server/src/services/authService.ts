import bcrypt from "bcrypt";
import JwtService from "./jwtService";
import { UserRepository } from "../repositories/userRepository";
import { User } from "../models/user";
import { Admin } from "../models/admin";
import { AdminRepository } from "../repositories/adminRepository";

class authService {
    private userRepository = new UserRepository();
    private adminRepository = new AdminRepository();
    private jwtService = new JwtService();

    async register(user: Omit<User, "id">): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(user.email);

        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(user.password, 12);
        return this.userRepository.create({
            ...user,
            password: hashedPassword,
        });
    }

    async login(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error("Invalid email or password");
        }
        const token = this.jwtService.generateToken({
            id: user.id,
            email: user.email,
            role: "user",
        });
        return token;
    }
    
    async registerAdmin(user: Omit<Admin, "id">): Promise<Admin> {
        const existingUser = await this.adminRepository.findByEmail(user.email);

        if (existingUser) {
            throw new Error("Admin already exists");
        }

        const hashedPassword = await bcrypt.hash(user.password, 12);
        return this.adminRepository.create({
            ...user,
            password: hashedPassword,
        });
    }

    async loginAdmin(email: string, password: string): Promise<string> {
        const admin = await this.adminRepository.findByEmail(email);
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            throw new Error("Invalid email or password");
        }
        const token = this.jwtService.generateToken({
            id: admin.id,
            email: admin.email,
            role: admin.role,
        });
        return token;
    }
}

export default authService;
