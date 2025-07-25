import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class QuizDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class AnswerDTO extends QuizDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;
}
