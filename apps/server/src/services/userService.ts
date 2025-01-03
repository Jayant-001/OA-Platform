import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/user';
import { HttpException } from '../middleware/errorHandler';
import { UserRequest } from '../models/user';; // Ensure this path is correct or adjust it to the correct location
import { UserDetails } from '../models/user';;

export class UserService {
  private userRepository = new UserRepository();

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findUserById(userId);
  }

  async createUser(user: Omit<UserRequest, 'id'>): Promise<void> {
    if (user.role !== 'user') {
         throw new HttpException(401, "NOT_AUTHORIZED", "Not Authorized To Create User");
    }
    return this.userRepository.createUser(user);
  }

  // TODO: Implement updateUser and deleteUser methods
  async updateUser(userId: string, userData: Partial<Omit<User, "email" | "password">>): Promise<void> {
    // const isExists = await this.userRepository.findById(userId);
    // if (isExists === null) {
    //   throw new HttpException(404, "USER_NOT_FOUND", "User not found");
    // }
    // return this.userRepository.update(userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    // const isExists = await this.userRepository.findById(userId);
    // if (isExists === null) {
    //   throw new HttpException(404, "USER_NOT_FOUND", "User not found");
    // }
    // return this.userRepository.delete(userId);
  }

  async userExists(userId: string): Promise<boolean> {
    return this.userRepository.userExists(userId);
  }
}
