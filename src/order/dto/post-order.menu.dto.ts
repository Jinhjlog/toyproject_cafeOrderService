import { IsArray, IsString } from 'class-validator';

export class PostOrderMenuDto {
  @IsArray()
  readonly order_menu: Array<Map<string, string>>;

  @IsString()
  readonly order_price: string;

  @IsString()
  readonly order_addr: string;
}
