import { block } from "./../interface/index";
import { IsMongoId, IsOptional, IsString } from "class-validator";
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

  @IsString()
  @IsOptional()
  public blocks: string;

  @IsString()
  @IsOptional()
  public pageName: string;
}
