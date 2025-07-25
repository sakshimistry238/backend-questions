import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  profilePicture: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string; // You should hash this before saving
}

export const UserSchema = SchemaFactory.createForClass(User);
