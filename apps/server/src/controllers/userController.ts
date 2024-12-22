import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { HttpException } from "../middleware/errorHandler";

export class UserController {
    private userService = new UserService();

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error: any) {
            throw new HttpException(500, "FETCH_USERS_FAILED", error.message);
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.getUserById(Number(req.params.id));
            if (user) {
                res.json(user);
            } else {
                throw new HttpException(404, "USER_NOT_FOUND", "User not found");
            }
        } catch (error: any) {
            throw new HttpException(500, "FETCH_USER_FAILED", error.message);
        }
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            throw new HttpException(400, "USER_CREATION_FAILED", error.message);
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            await this.userService.updateUser(Number(req.params.id), req.body);
            res.status(204).send();
        } catch (error: any) {
            throw new HttpException(400, "USER_UPDATE_FAILED", error.message);
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            await this.userService.deleteUser(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            throw new HttpException(400, "USER_DELETION_FAILED", error.message);
        }
    }
}
