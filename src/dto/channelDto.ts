import { IsEmail, IsInt, IsOptional, IsString, Min } from "class-validator";

//채널 정보
export class ChannelDto {
  // 채널 아이디
  @IsOptional()
  channel: number;

  // 채널 이름
  @IsOptional()
  @IsString()
  channelName: string;

  @IsOptional()
  channelImg: string;

  @IsOptional()
  blockId: string;
}

export class InviteDto {
  @IsOptional()
  @IsString()
  channelCode: string;

  @IsOptional()
  @IsString()
  adminCode: string;
}
