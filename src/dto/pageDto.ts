import "reflect-metadata";
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { block } from "../interface";

// 제목 2-10글자
export class PageDto {
  @IsMongoId()
  @IsOptional()
  public id: string;

  @IsString()
  @IsOptional()
  public type: string;

  @IsString()
  @IsOptional()
  public blockId: string;

  @IsArray()
  @IsOptional()
  public label: string[];

  @IsArray()
  @IsOptional()
  public blocks: block[];

  @IsString()
  @IsOptional()
  public pageName: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  public channel: string;
}
