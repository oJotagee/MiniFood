import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordConfirmDto {
  @ApiProperty({
    description: 'Token de reset recebido por e-mail',
  })
  @IsString({ message: 'O token deve ser uma string' })
  @IsNotEmpty({ message: 'O token não pode estar vazio' })
  token!: string;

  @ApiProperty({
    description: 'Nova senha',
    example: 'nova-senha-forte-123',
    minLength: 8,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  newPassword!: string;
}
