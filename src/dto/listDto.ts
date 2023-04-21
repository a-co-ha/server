import "reflect-metadata";
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { list } from "../interface";

export class ListDto {
  @IsMongoId()
  @IsOptional()
  public id: string;

  @IsString()
  @IsOptional()
  public type: string;

  @IsArray()
  @IsOptional()
  public EditablePage: list;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  public channel: string;
}
