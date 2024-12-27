import bcrypt from "bcrypt";
import JwtService from "./jwtService";
import { UserRepository } from "../repositories/userRepository";
import { UserRequest } from "../models/user";
import { Admin } from "../models/admin";
import { AdminRepository } from "../repositories/adminRepository";

class authService {
    private userRepository = new UserRepository();
    private adminRepository = new AdminRepository();
    private jwtService = new JwtService();

    async register(user: Omit<UserRequest, "id">): Promise<void> {
        const existingUser = await this.userRepository.findByEmail(user.email);

        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(user.password, 12);
        user.password = hashedPassword;
        return this.userRepository.createUser({
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
            role: user.role,
        });
        return token;
    }
    
  
}

export default authService;
