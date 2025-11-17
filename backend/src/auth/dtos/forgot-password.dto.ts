import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'auth.email.invalid' })
  @IsNotEmpty({ message: 'auth.email.required' })
  email: string;
}