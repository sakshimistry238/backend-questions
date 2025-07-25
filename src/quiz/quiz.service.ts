import { HttpStatus, Injectable } from '@nestjs/common';
import { AnswerDTO, QuizDTO } from './dto/create-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Questions, Quiz, QuizDocument } from './entities/quiz.entity';
import mongoose, { Model } from 'mongoose';
import { CustomError } from 'src/common/exceptions';
import {
  QuestionStatus,
  QuizStatus,
  Status,
} from 'src/common/constants/enum.constant';
import { TypeExceptions } from 'src/common/helpers/exceptions';
import { endOfDay, startOfDay } from 'date-fns';
import { randomInt } from 'crypto';
import { UsersService } from 'src/users/users.service';
import { QuestionService } from 'src/questions/questions.service';
import { Question } from 'src/questions/entities/question.entity';
import { QuizError } from 'src/common/helpers/exceptions/quiz.exception';
@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    private readonly usersService: UsersService,
    private readonly questionsService: QuestionService,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}
  // async createQuiz(): Promise<QuizDocument | boolean> {
  //   try {
  //     const existingQuiz = await this.quizModel.find();

  //     if (existingQuiz.length > 0) {
  //       return true; // or throw an error if only one quiz should exist
  //     }

  //     const quiz = new this.quizModel(QUIZ_DATA);
  //     return await quiz.save();
  //   } catch (err) {
  //     throw CustomError.UnknownError(err.message || 'Unknown error occurred');
  //   }
  // }

  async rendomQuiz(quizDTO: QuizDTO) {
    try {
      const findUser = await this.quizModel.findOne({
        userId: quizDTO.userId,
        status: Status.ACTIVE,
      });

      if (!findUser) {
        throw CustomError.UnknownError('Quiz session not found for user.');
      }

      // Validation
      if (findUser.currentLevel !== (findUser.questions?.length ?? 0)) {
        throw QuizError.ClearPreQus();
      }

      if (findUser.status === Status.FORFEITED) {
        throw QuizError.PlayNotMore();
      }

      if (findUser.status === Status.COMPLETED) {
        throw QuizError.WinGame({ currentLevel: findUser.currentLevel });
      }

      // Extract used question IDs
      const usedQuestionIds =
        findUser.questions?.map((q) => q.questionId.toString()) ?? [];

      // Fetch questions not yet used by the user
      const remainingQuizzes = await this.questionModel
        .find({
          _id: { $nin: usedQuestionIds },
        })
        .select('question options');

      if (remainingQuizzes.length === 0) {
        throw CustomError.UnknownError('No more questions available.');
      }
      const findRandomQuiz = this.getRandomQuiz(remainingQuizzes);

      return {
        ...(findRandomQuiz.toObject?.() ?? findRandomQuiz), // optional: handle mongoose doc
        currentLevel: findUser.currentLevel,
      };
    } catch (err: any) {
      throw CustomError.customException(
        err.message,
        err.statusCode ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  getRandomQuiz(questions: any[]) {
    const index = Math.floor(Math.random() * questions.length);
    return questions[index];
  }

  async startQuiz(userId: string) {
    try {
      const dbuser = await this.verifyUser(userId);

      if (!dbuser) {
        throw CustomError.UnknownError('user not found');
      }

      const validate = await this.quizModel.findOne({
        userId: dbuser.id,
        status: Status.ACTIVE,
      });

      if (validate) {
        throw TypeExceptions.OnlyOneQuizCanStart();
      }

      const data: Quiz = {
        userId: userId,
        status: Status.ACTIVE,
        winAmount: 0,
        questions: [],
        currentLevel: 0,
        prizeMoney: 0,
      };
      return await this.quizModel.create(data);
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async generateQuestion(user: any) {
    try {
      const dbuser = await this.verifyUser(user.id);

      if (!dbuser) {
        throw CustomError.UnknownError('User not found.');
      }

      const validate = await this.quizModel.findOne({
        userId: dbuser.id,
        status: Status.ACTIVE,
      });

      if (!validate) {
        throw CustomError.UnknownError('No any active quiz found.');
      }

      const questions = validate.questions.map((que) => que.questionId);

      // const resp = await firstValueFrom(
      //   this.queClient.send(GET_RANDOM_QUESTION, { questions }),
      // );
      const resp = await this.questionsService.getRendomQuestion(questions);
      
      return {
        _id: resp._id,
        question: resp.question,
        options: resp.options,
        time: 60,
      };
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async checkAnswer(body: AnswerDTO, user: any) {
    try {
      if (typeof body === 'string') body = JSON.parse(body);

      const dbuser = await this.verifyUser(user.userId);
      if (!dbuser) {
        throw CustomError.UnknownError('user not found');
      }

      const data = await this.quizModel.findOne({
        userId: dbuser.id,
        status: Status.ACTIVE,
      });

      if (!data) {
        throw CustomError.UnknownError('No any active quiz found.');
      }

      // const resp = await firstValueFrom(
      //   this.queClient.send(GET_SINGLE_QUESTION, { _id: body.question }),
      // );

      const resp = await this.questionModel.findOne({ _id: body.question });
      console.log(resp,body,"resp");
      
      const queData: Questions = {
        questionId: new mongoose.Types.ObjectId(resp._id.toString()),
        questionStatus:
          resp.answer === body.answer.trim()
            ? QuestionStatus.CORRECT
            : QuestionStatus.WRONG,
      };
      const storeData = {
        currentLevel: data.currentLevel + 1,
        $push: { questions: queData },
      };

      if (storeData.currentLevel === 4) {
        storeData['winAmount'] = 1000;
      } else if (storeData.currentLevel === 7) {
        storeData['winAmount'] = 1000000;
      } else if (storeData.currentLevel >= 8) {
        storeData['winAmount'] = data.winAmount * 10;
      }

      if (
        queData.questionStatus === QuestionStatus.WRONG ||
        storeData.currentLevel >= 10
      ) {
        storeData['status'] = Status.COMPLETED;
      }

      const quizData = await this.quizModel.findOneAndUpdate(
        {
          _id: data._id,
          userId: dbuser.id,
          status: Status.ACTIVE,
        },
        storeData,
      );

      return {
        currentLevel: quizData.currentLevel + 1,
        winAmount: quizData.winAmount,
        answer: resp.answer,
        isCorrect: resp.answer === body.answer.trim(),
      };
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async updateQuizStatus(body) {
    try {
      await this.quizModel.findOneAndUpdate(
        {
          userId: body.data.user.id,
          status: Status.ACTIVE,
        },
        {
          status: Status.TIME_OUT,
        },
      );
    } catch (error) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async verifyUser(id: string) {
    try {
      // const resp = await firstValueFrom(this.userClient.send(GET_BY_ID, id));
      const resp = await this.usersService.getUserById(id);

      if (!resp) {
        throw CustomError.UnknownError('User not found.');
      }

      return resp;
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async getRankedUser() {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      const pipeline = [];
      pipeline.push({
        $match: {
          createdAt: { $gte: todayStart, $lt: todayEnd },
          status: Status.COMPLETED,
        },
      });

      pipeline.push({
        $addFields: {
          timeGap: {
            $subtract: ['$updatedAt', '$createdAt'],
          },
        },
      });

      pipeline.push({
        $sort: {
          timeGap: 1,
          winAmount: -1,
        },
      });

      pipeline.push({
        $sort: {
          currentLevel: -1,
        },
      });

      pipeline.push({
        $limit: 10,
      });

      const users = await this.quizModel.aggregate(pipeline);

      const id = users.map((u) => u.userId);
      // const resp = await firstValueFrom(
      //   this.userClient.send(GET_SELECTED_USER_BY_ID, { id }),
      // );
      const resp = await this.usersService.getSelectedUsers(id);

      const data = [];
      users.forEach((user) => {
        data.push({
          name: resp.find((usr) => usr.id === user.userId).firstName,
          winAmount: user.winAmount,
          currentLevel: user.currentLevel,
          timeGap: user.timeGap,
        });
      });
      return data;
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async myQuiz(
    body: {
      page: number;
      limit: number;
      search: string;
      // skip?: number;
    },
    user: any,
  ) {
    try {
      const limit = body.limit ? Number(body.limit) : 10;
      const page = body.page ? Number(body.page) : 1;
      const skip = (page - 1) * limit;

      const query = [];

      query.push({
        $match: {
          userId: user.id,
        },
      });

      query.push({
        $sort: {
          createdAt: -1,
        },
      });

      query.push({
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total_records: [{ $count: 'count' }],
        },
      });

      const data = await this.quizModel.aggregate(query);
      if (data.length) {
        data[0].total_records =
          data[0].total_records.length > 0 ? data[0].total_records[0].count : 0;
      }
      return data[0];
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async quitQuiz(user: any) {
    try {
      const dbuser = await this.verifyUser(user.userId);
      if (!dbuser) {
        throw CustomError.UnknownError('user not found');
      }

      const data = await this.quizModel.findOne({
        userId: dbuser.id,
        status: Status.ACTIVE,
      });

      if (!data) {
        throw CustomError.UnknownError('No any active quiz found.');
      }

      const quizData = await this.quizModel.findOneAndUpdate(
        {
          _id: data._id,
          userId: dbuser.id,
          status: Status.ACTIVE,
        },
        {
          status: Status.COMPLETED,
        },
      );

      return {
        currentLevel: quizData.currentLevel + 1,
        winAmount: quizData.winAmount,
      };
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async lifeline(user: any, body: any) {
    try {
      const dbuser = await this.verifyUser(user.id);
      if (!dbuser) {
        throw CustomError.UnknownError('user not found');
      }

      // const resp = await firstValueFrom(
      //   this.queClient.send(GET_SINGLE_QUESTION, { _id: body.questionId }),
      // );
      const resp = await this.questionsService.findOne(body.questionId);

      const int = randomInt(0, 3);

      const answer: string[] = [];
      if (body.lifeline === 'askToAi') {
        answer.push(resp.options[int]);
      }

      if (body.lifeline === '50-50') {
        const index = int + 1 >= 4 ? int - 1 : int + 1;
        resp.options[int] !== resp.answer
          ? answer.push(resp.options[int])
          : answer.push(resp.options[index]);
        answer.push(resp.answer);
      }

      return { answer, lifeline: body.lifeline };
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }

  async leaderboard(body: {
    page: number;
    limit: number;
    search: string;
    // skip: number;
  }) {
    try {
      const limit = body.limit ? Number(body.limit) : 10;
      const page = body.page ? Number(body.page) : 1;
      const skip = (page - 1) * limit;

      const pipeline = [];

      pipeline.push({
        $addFields: {
          timeGap: {
            $subtract: ['$updatedAt', '$createdAt'],
          },
        },
      });

      pipeline.push({
        $sort: {
          timeGap: 1,
          updatedAt: -1,
          winAmount: -1,
        },
      });

      pipeline.push({
        $sort: {
          currentLevel: -1,
        },
      });

      pipeline.push({
        $facet: {
          quiz: [{ $skip: skip }, { $limit: limit }],
          total_records: [{ $count: 'count' }],
        },
      });

      const data = await this.quizModel.aggregate(pipeline);

      const id = data[0].quiz.map((u) => u.userId);
      // const resp = await firstValueFrom(
      //   this.userClient.send(GET_SELECTED_USER_BY_ID, { id }),
      // );
      const resp = await this.usersService.getSelectedUsers(id);

      const response = {
        data: [],
        total_records: data[0]?.total_records[0]?.count || 0,
      };
      data[0].quiz.forEach((user) => {
        response.data.push({
          name: resp.find((usr) => usr.id === user.userId).firstName,
          winAmount: user.winAmount,
          currentLevel: user.currentLevel,
          timeGap: user.timeGap,
          status: user.status,
        });
      });
      return response;
    } catch (error: any) {
      if (error) {
        throw error;
      } else {
        throw CustomError.UnknownError(error?.message);
      }
    }
  }
}
