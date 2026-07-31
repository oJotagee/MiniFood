import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRoleDto {
  CUSTOMER = 'customer',
  ESTABLISHMENT = 'establishment',
  COURIER = 'courier',
}

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  name!: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'joao@example.com',
  })
  @IsEmail({}, { message: 'O e-mail deve ser um e-mail válido' })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha-forte-123',
    minLength: 8,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  password!: string;

  @ApiProperty({
    description: 'Papel do usuário',
    enum: UserRoleDto,
    example: UserRoleDto.CUSTOMER,
  })
  @IsEnum(UserRoleDto, {
    message: 'O papel do usuário deve ser customer, establishment ou courier',
  })
  role!: UserRoleDto;
}
