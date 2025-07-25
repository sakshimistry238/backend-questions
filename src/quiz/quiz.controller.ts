import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AnswerDTO, QuizDTO } from './dto/create-quiz.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommonListDto } from 'src/common/dto/common.dto';
import {
  Public,
  ResponseMessage,
} from 'src/common/decorators/response.decorator';
import {
  CHANGE_STATUS,
  CORRECT_ANSWER,
  QUIT_GAME,
  QUIZ_FETCH,
} from 'src/common/helpers/responses/success.helper';
@Controller('quiz')
@ApiBearerAuth()
@ApiTags('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('start-quiz')
  @ApiBearerAuth()
  async startQuiz(@Req() request) {
    console.log(request.user, 'request.user');
    return await this.quizService.startQuiz(request.user.userId);
  }

  @Public()
  @Post('get-ranked-user')
  async getRankedUser() {
    return await this.quizService.getRankedUser();
  }

  @ApiBearerAuth()
  @Post('my-quiz')
  async myQuiz(@Body() body: CommonListDto, @Req() request) {
    return await this.quizService.myQuiz(body, request.user);
  }

  @Public()
  @Post('leaderboard')
  async leaderboard(@Body() body: CommonListDto) {
    return await this.quizService.leaderboard(body);
  }
  @Post()
  @ResponseMessage(QUIZ_FETCH)
  @HttpCode(HttpStatus.OK)
  rendomQuiz(@Req() req) {
    return this.quizService.rendomQuiz(req.user);
  }

  @Post('/answer')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(CORRECT_ANSWER)
  checkAnswer(@Body() answerDTO: AnswerDTO, @Req() req) {
    return this.quizService.checkAnswer(answerDTO, req.user);
  }

  @Post('/quitGame')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(QUIT_GAME)
  quitGame(@Req() req) {
    return this.quizService.quitQuiz(req.user);
  }

  @Post('/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(CHANGE_STATUS)
  changeStatus(@Req() req) {
    return this.quizService.updateQuizStatus(req.user);
  }
}
