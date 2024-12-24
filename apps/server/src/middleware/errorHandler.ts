import { Request, Response, NextFunction } from "express";

export class HttpException extends Error {
    status: number;
    code: string;
    message: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
        this.message = message;
    }
}

export const errorHandler = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    const code = err.code || "INTERNAL_SERVER_ERROR";
    res.status(status).json({ code, message });
};
