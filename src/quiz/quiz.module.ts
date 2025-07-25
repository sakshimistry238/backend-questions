import { Module, OnModuleInit } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema } from './entities/quiz.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/entity/user.entity';
import {
  Question,
  QuestionSchema,
} from 'src/questions/entities/question.entity';
import { QuestionService } from 'src/questions/questions.service';
import { QuizGateway } from './quiz.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: User.name, schema: UserSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService, UsersService, QuestionService, QuizGateway],
})
export class QuizModule {}
