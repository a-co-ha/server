import "reflect-metadata";
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { pageStatusUpdate } from "../interface/templateInterface";

// 제목 2-10글자
export class TemplateDto {
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
  public pages: pageStatusUpdate[];

  @MinLength(2)
  @MaxLength(10)
  @IsString()
  @IsOptional()
  public pageName: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  public channel: string;
}
