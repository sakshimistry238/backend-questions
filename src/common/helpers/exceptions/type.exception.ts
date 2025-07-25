import { HttpException, HttpStatus } from '@nestjs/common';

export const TypeExceptions = {
  UserNotFound(): HttpException {
    return new HttpException(
      {
        message: 'User not found',
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  },

  UserAlreadyExists(): HttpException {
    return new HttpException(
      {
        message: 'User already exists',
        error: 'UserAlreadyExists',
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  },

  InvalidFile(): HttpException {
    return new HttpException(
      {
        message: 'Uploaded file is invalid',
        error: 'InvalidFile',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  },
  OnlyOneQuizCanStart() {
    return new HttpException(
      {
        message: 'Only one quiz can run at time.',
        error: 'OnlyOneQuizCanStart',
        statusCode: HttpStatus.NOT_ACCEPTABLE,
      },
      HttpStatus.BAD_REQUEST,
    );
  },
};
