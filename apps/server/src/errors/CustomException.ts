export class CustomException extends Error {
  statusCode: number;
  errorCode: string;

  constructor(statusCode: number, errorCode: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'CustomException';
  }

  static notFound(message = 'Resource not found') {
    return new CustomException(404, 'NOT_FOUND', message);
  }

  static badRequest(message: string) {
    return new CustomException(400, 'BAD_REQUEST', message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new CustomException(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden') {
    return new CustomException(403, 'FORBIDDEN', message);
  }

  static internal(message = 'Internal Server Error') {
    return new CustomException(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
