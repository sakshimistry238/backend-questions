import { Module, OnModuleInit } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionService } from './questions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './entities/question.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionsModule implements OnModuleInit {
  constructor(private questionService: QuestionService) {}

  onModuleInit() {
    const quiz = this.questionService.createQuestions();
    // const lifeLine = this.quizService.createLifeLine();
    return quiz;
  }
}
