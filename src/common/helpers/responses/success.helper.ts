import { HttpStatus } from '@nestjs/common';
export const SUCCESS_RESPONSES = {
  CREATED: {
    MESSAGE: 'Created successfully.',
    STATUS_CODE: HttpStatus.CREATED,
  },
  UPDATED: {
    MESSAGE: 'Updated successfully.',
    STATUS_CODE: HttpStatus.OK,
  },
  DELETED: {
    MESSAGE: 'Deleted successfully.',
    STATUS_CODE: HttpStatus.OK,
  },
};

export const RESPONSE_SUCCESS = 'Response success';
export const INVALID_USER = 'Invalid user';
export const LIFE_LINE_NOT_EXISTS = 'Lifeline not exist';
export const QUESTION_NOT_EXISTS = 'Question not exist';
export const INCORRECT_ANSWER = 'Incorrect answer';
export const LIFE_LINE_USED = 'This lifeline is already used';
export const CLEAR_PREV_QUES = 'First clear the previous question';
export const PLAY_NOT_MORE = 'You can not play more';
export const WIN_GAME = 'You have already win the game';
export const STATUS_ASSIGN = 'Status already assigned';
export const NOT_QUIT_GAME = 'You can not quit the game';
export const LIFE_LINE_CHOOSE = 'Life line choose successfully';

export const CREATE_USER = 'Create user successfully.';

export const QUIZ_FETCH = 'Quiz fetch successfully';
export const CORRECT_ANSWER = 'Your answer is correct';
export const QUIT_GAME = 'Quit game successfully';
export const CHANGE_STATUS = 'Quiz status changed successfully';
