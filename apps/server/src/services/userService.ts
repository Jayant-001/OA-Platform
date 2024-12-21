import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/user';

export class UserService {
  private userRepository = new UserRepository();

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.userRepository.create(user);
  }

  async updateUser(id: number, user: Partial<Omit<User, 'id'>>): Promise<void> {
    await this.userRepository.update(id, user);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
