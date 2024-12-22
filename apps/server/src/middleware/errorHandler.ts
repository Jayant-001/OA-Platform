import { Request, Response, NextFunction } from "express";

class HttpException extends Error {
    status: number;
    customCode: string;
    message: string;

    constructor(status: number, customCode: string, message: string) {
        super(message);
        this.status = status;
        this.customCode = customCode;
        this.message = message;
    }
}

const errorHandler = (
    err: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = err.status || 500;
    const customCode = err.customCode || "INTERNAL_SERVER_ERROR";
    const message = err.message || "Something went wrong";
    res.status(status).json({ status, customCode, message });
};

export { HttpException, errorHandler };
