import { IsEmail, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Channel_UserAttributes } from "../interface";

//채널 정보
export class ChannelDto implements Channel_UserAttributes {
  // 채널 아이디
  @IsOptional()
  channelId: number;

  @IsInt()
  // 채널 주인 아이디
  userId: number;

  @IsString()
  // 채널 주인 이름
  name: string;

  // 채널 이름
  @IsString()
  channelName: string;

  @IsOptional()
  channelImg: string;
}
