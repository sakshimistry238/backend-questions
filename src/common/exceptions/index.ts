import { HttpException, HttpStatus } from '@nestjs/common';

export const CustomError = {
  UnknownError(message: string): any {
    return new HttpException(
      {
        message: message || 'UnknownError',
        error: 'UnknownError',
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN,
    );
  },
  customException(message: any, errorCode: any, data?: any): any {
    const error = errorCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    return new HttpException(
      {
        message: message || 'Internal Server Error',
        error: error,
        statusCode: error,
        data: data ?? {},
      },
      error,
    );
  },
};
