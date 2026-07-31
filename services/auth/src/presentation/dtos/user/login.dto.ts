import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'joao@example.com',
  })
  @IsEmail({}, { message: 'O e-mail deve ser um e-mail válido' })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha-forte-123',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  password!: string;
}
