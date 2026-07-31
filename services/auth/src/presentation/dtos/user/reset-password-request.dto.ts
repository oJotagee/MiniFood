import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'joao@example.com',
  })
  @IsEmail({}, { message: 'O e-mail deve ser um e-mail válido' })
  email!: string;
}
