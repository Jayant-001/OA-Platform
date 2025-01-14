import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { CustomException } from "../errors/CustomException";

const userService = new UserService();

const userAuthorizationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const exists = await userService.getUserById(req.user?.id as string);
    console.log(exists)
    if (!exists || exists.role !== "user") {
        return next(new CustomException(403, "FORBIDDEN","User not authorized" ));
    }

    next();
};

export { userAuthorizationMiddleware };
