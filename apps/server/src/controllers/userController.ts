import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { HttpException } from "../middleware/errorHandler";

export class UserController {
    private userService = new UserService();

    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await this.userService.getUserById(req.params.userId);
            if (user) {
                res.json(user);
            } else {
                throw new HttpException(404, "USER_NOT_FOUND", "User not found");
            }
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }


    // async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         await this.userService.updateUser(req.params.userId, req.body);
    //         res.status(204).send();
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         await this.userService.deleteUser(req.params.userId);
    //         res.status(204).send();
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}
