import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/user';
import { CustomException } from '../errors/CustomException';
import { UserRequest } from '../models/user';
import { UserDetails } from '../models/user';

export class UserService {
  private userRepository = new UserRepository();

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async getUserById(userId: string): Promise<UserRequest | null> {
    return this.userRepository.findUserById(userId);
  }


  // TODO: Implement updateUser and deleteUser methods
  async updateUser(userId: string, userData: Partial<Omit<User, "email" | "password">>): Promise<void> {
    // const isExists = await this.userRepository.findById(userId);
    // if (isExists === null) {
    //   throw new CustomException(404, "User not found", "USER_NOT_FOUND");
    // }
    // return this.userRepository.update(userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    // const isExists = await this.userRepository.findById(userId);
    // if (isExists === null) {
    //   throw new CustomException(404, "User not found", "USER_NOT_FOUND");
    // }
    // return this.userRepository.delete(userId);
  }

  async userExists(userId: string): Promise<boolean> {
    return this.userRepository.userExists(userId);
  }
}
