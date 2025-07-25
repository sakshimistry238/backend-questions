import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response.constant';
import {
  Public,
  ResponseMessage,
} from '../common/decorators/response.decorator';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ResponseMessage(RESPONSE_MESSAGES.USER_INSERTED)
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('getAll')
  @ResponseMessage(RESPONSE_MESSAGES.USER_LISTED)
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('get/:id')
  @ResponseMessage(RESPONSE_MESSAGES.USER_LISTED)
  @Public()
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch('update/:id')
  @ResponseMessage(RESPONSE_MESSAGES.USER_UPDATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('delete/:id')
  @ResponseMessage(RESPONSE_MESSAGES.USER_DELETED)
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
