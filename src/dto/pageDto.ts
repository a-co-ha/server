import { IsArray, IsMongoId, IsOptional, IsString } from "class-validator";
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

  @IsString()
  @IsOptional()
  public label: string;

  @IsArray()
  @IsOptional()
  public blocks: block[];

  @IsString()
  @IsOptional()
  public pageName: string;
}