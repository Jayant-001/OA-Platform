import bcrypt from "bcrypt";
import JwtService from "./jwtService";
import { UserRepository } from "../repositories/userRepository";
import { User } from "../models/user";

class AuthService {
    private userRepository = new UserRepository();
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
        });
        return token;
    }
}

export default AuthService;
