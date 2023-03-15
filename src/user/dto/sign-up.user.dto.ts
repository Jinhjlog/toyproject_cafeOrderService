import { IsOptional, IsString } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  readonly user_email: string;

  @IsString()
  readonly user_name: string;

  @IsString()
  readonly user_pw: string;

  @IsOptional()
  @IsString()
  readonly user_role: string;
}
