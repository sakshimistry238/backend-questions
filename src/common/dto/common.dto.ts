import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  ValidateIf,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class DateRangeDto {
  @ApiProperty({ type: Date, format: 'date' })
  @ValidateIf((r) => r.endDate)
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ type: Date, format: 'date' })
  @ValidateIf((r) => r.startDate)
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
export class CommonListDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsOptional()
  search: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortOrder: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortBy: string;
}
export class IdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
