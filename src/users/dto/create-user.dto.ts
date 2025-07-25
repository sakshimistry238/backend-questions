import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  lastName: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  profilePicture?: string;

  @IsNotEmpty()
  @ApiProperty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(6)
  password: string;
}
