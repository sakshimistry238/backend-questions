import { HttpException, HttpStatus } from '@nestjs/common';
import {
  CLEAR_PREV_QUES,
  INCORRECT_ANSWER,
  INVALID_USER,
  LIFE_LINE_NOT_EXISTS,
  LIFE_LINE_USED,
  NOT_QUIT_GAME,
  PLAY_NOT_MORE,
  QUESTION_NOT_EXISTS,
  STATUS_ASSIGN,
  WIN_GAME,
} from '../responses/success.helper';
const badRequestError = HttpStatus.BAD_REQUEST;
const successCode = HttpStatus.OK;
export const QuizError = {
  UserNotFound(): any {
    return new HttpException(
      {
        message: INVALID_USER,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  LifelineNotFound(): any {
    return new HttpException(
      {
        message: LIFE_LINE_NOT_EXISTS,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  QuestionNotFound(): any {
    return new HttpException(
      {
        message: QUESTION_NOT_EXISTS,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  IncorrectAnswer(data?: any): any {
    return new HttpException(
      {
        message: INCORRECT_ANSWER,
        error: badRequestError,
        statusCode: badRequestError,
        data,
      },
      badRequestError,
    );
  },

  LifelineUsed(): any {
    return new HttpException(
      {
        message: LIFE_LINE_USED,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  ClearPreQus(): any {
    return new HttpException(
      {
        message: CLEAR_PREV_QUES,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  PlayNotMore(): any {
    return new HttpException(
      {
        message: PLAY_NOT_MORE,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  WinGame(data?: any): any {
    return new HttpException(
      {
        message: WIN_GAME,
        error: successCode,
        statusCode: successCode,
        data,
      },
      successCode,
    );
  },

  StatusAssigned(): any {
    return new HttpException(
      {
        message: STATUS_ASSIGN,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },

  NotQuitGame(): any {
    return new HttpException(
      {
        message: NOT_QUIT_GAME,
        error: badRequestError,
        statusCode: badRequestError,
      },
      badRequestError,
    );
  },
};
