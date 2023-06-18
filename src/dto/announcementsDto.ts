import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import "reflect-metadata";

export class AnnouncementsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  id: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  channel: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;
}
