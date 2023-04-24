import { IsMongoId, IsOptional, IsString, MaxLength } from "class-validator";

export class BookMarkDto {
  @IsOptional()
  @IsString()
  bookmarkId: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  bookmarkName: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsMongoId()
  @IsOptional()
  roomId: string;
}
