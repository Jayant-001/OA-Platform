import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { CustomException } from "../errors/CustomException";

export class UserController {
    private userService = new UserService();

    async getAllUsers(req: Request, res: Response): Promise<void> {
            const users = await this.userService.getAllUsers();
            res.json(users);
     
    }

    async getUserById(req: Request, res: Response): Promise<void> {
            const user = await this.userService.getUserById(req.params.userId);
            if (user) {
                res.json(user);
            } else {
                throw new CustomException(404, "USER_NOT_FOUND", "User not found");
            }
    
    }

    async createUser(req: Request, res: Response): Promise<void> {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        
    }

    async getUser(req: Request, res: Response): Promise<void> {
        const user = await this.userService.getUserById(req.user?.id as string);
        if (!user) {
            throw new CustomException(404, "USER_NOT_FOUND", "User not found");
        }
        const filteredUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            branch: user.branch,
            batch: user.batch,
        };

        res.json(filteredUser);
            res.json(user);
        
    }


    // async updateUser(req: Request, res: Response): Promise<void> {
    //     try {
    //         await this.userService.updateUser(req.params.userId, req.body);
    //         res.status(204).send();
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // async deleteUser(req: Request, res: Response): Promise<void> {
    //     try {
    //         await this.userService.deleteUser(req.params.userId);
    //         res.status(204).send();
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}
