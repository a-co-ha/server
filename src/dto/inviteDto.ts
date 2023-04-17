import { IsMongoId, IsOptional, IsString } from "class-validator";

export class InviteDto {
  @IsOptional()
  @IsString()
  channelCode: string;

  @IsOptional()
  @IsString()
  adminCode: string;
}
