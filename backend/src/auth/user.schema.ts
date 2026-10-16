import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  dateOfBirth?: string;

  @Prop()
  timeOfBirth?: string;

  @Prop()
  placeOfBirth?: string;

  @Prop()
  zodiacSign?: string;

  @Prop({ type: Array, default: [] })
  savedKundlis: any[];

  @Prop({ type: Array, default: [] })
  savedReadings: any[];

  @Prop({ default: 100 })
  walletBalance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
