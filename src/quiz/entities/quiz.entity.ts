import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { QuestionStatus, Status } from 'src/common/constants/enum.constant';

export type QuizDocument = Quiz & Document;

@Schema({ collection: 'quiz', timestamps: true })
export class Quiz {
  @Prop({ required: false, type: mongoose.Types.ObjectId, ref: 'users' })
  userId: string;

  @Prop({ required: false, default: Status.IDEAL })
  status: Status;

  @Prop({ required: false, default: 0 })
  winAmount: number;

  @Prop({ required: false, default: 0 })
  currentLevel: number;

  @Prop({
    required: false,
    type: [
      {
        questionId: { type: mongoose.Types.ObjectId, ref: 'questions' },
        questionStatus: { type: String, enum: Object.values(QuestionStatus) },
      },
    ],
    default: [],
  })
  questions: Questions[];

  @Prop({ required: false, default: 0 })
  prizeMoney: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

export interface Questions {
  questionId: mongoose.Types.ObjectId;
  questionStatus: QuestionStatus;
}
