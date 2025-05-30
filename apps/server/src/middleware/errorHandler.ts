import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../errors/CustomException';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomException) {
        return res.status(err.statusCode).json({
            status: 'error',
            errorCode: err.errorCode,
            message: err.message
        });
    }

    console.log(err);

    // Handle unhandled errors
    const internalError = CustomException.internal();
    return res.status(internalError.statusCode).json({
        status: 'error',
        errorCode: internalError.errorCode,
        message: err.message
    });
};
