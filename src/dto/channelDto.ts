import { IsEmail, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Channel_UserAttributes } from "../interface";

export class ChannelDto implements Channel_UserAttributes {
  userId: number;

  userName: string;

  channelId: number;

  @IsString()
  channelName: string;
}
