import { IsNumber, IsOptional, IsString } from 'class-validator';

export class InsertMenuDto {
  @IsString()
  readonly menu_name: string;

  @IsString()
  readonly menu_price: string;

  @IsString()
  readonly menu_state: string;

  @IsString()
  readonly menu_type: string;

  @IsOptional()
  @IsString()
  readonly menu_img: string;

  @IsOptional()
  @IsString()
  readonly docId: string;
}
