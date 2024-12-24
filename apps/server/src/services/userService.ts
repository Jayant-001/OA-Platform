import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/user';
import { HttpException } from '../middleware/errorHandler';

export class UserService {
  private userRepository = new UserRepository();

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.userRepository.create(user);
  }

  async updateUser(userId: string, userData: Partial<Omit<User, "email" | "password">>): Promise<void> {
    const isExists = await this.userRepository.findById(userId);
    if (isExists === null) {
      throw new HttpException(404, "USER_NOT_FOUND", "User not found");
    }
    return this.userRepository.update(userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    const isExists = await this.userRepository.findById(userId);
    if (isExists === null) {
      throw new HttpException(404, "USER_NOT_FOUND", "User not found");
    }
    return this.userRepository.delete(userId);
  }
}
