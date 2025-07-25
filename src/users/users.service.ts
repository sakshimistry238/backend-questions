import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../common/dto/common.dto';
import { AuthExceptions, TypeExceptions } from '../common/helpers/exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    // Check duplicate user
    if (await this.getUserByEmail(dto.email)) {
      throw TypeExceptions.UserAlreadyExists();
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    return user.save();
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(userId: number) {
    return await this.userModel.findById(userId);
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(
      { id: userId },
      updateUserDto,
      { new: true },
    );
  }

  async remove(userId: number) {
    return await this.userModel.findByIdAndDelete(userId);
  }

  async login(params: LoginDto) {
    const user = await this.userModel.findOne({
      email: params.email,
    });
    if (!user) {
      throw AuthExceptions.AccountNotExist();
    }

    if (!bcrypt.compareSync(params.password, user.password)) {
      throw AuthExceptions.InvalidIdPassword();
    }
    delete user.password;

    return user;
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  async getSelectedUsers(ids: string[]) {
    try {
      const users = await this.userModel
        .find({ _id: { $in: ids } })
        .sort({ _id: 1 }) // ASC
        .exec();

      return users;
    } catch (error: any) {
      throw new Error('Failed to fetch users');
    }
  }
  async getUserById(id: string): Promise<any> {
    return await this.userModel.findOne({ _id: id });
  }
}
