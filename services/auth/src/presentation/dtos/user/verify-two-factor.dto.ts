import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'Id do desafio de 2FA retornado pelo login',
  })
  @IsString({ message: 'O challengeId deve ser uma string' })
  @IsNotEmpty({ message: 'O challengeId não pode estar vazio' })
  challengeId!: string;

  @ApiProperty({
    description: 'Código de 6 dígitos enviado por e-mail',
    example: '123456',
  })
  @IsString({ message: 'O código deve ser uma string' })
  @Length(6, 6, { message: 'O código deve ter 6 dígitos' })
  code!: string;
}
