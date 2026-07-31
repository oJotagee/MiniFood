import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  name?: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'joao@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O e-mail deve ser um e-mail válido' })
  email?: string;
}
