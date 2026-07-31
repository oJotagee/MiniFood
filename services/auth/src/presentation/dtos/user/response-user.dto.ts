import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  id!: string;

  @ApiProperty({ example: 'João da Silva' })
  name!: string;

  @ApiProperty({ example: 'joao@example.com' })
  email!: string;

  @ApiProperty({ example: 'customer', enum: ['customer', 'establishment', 'courier'] })
  role!: string;

  @ApiProperty({ example: false })
  twoFactorEnabled!: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class TokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ description: 'Tempo de expiração do access token, em segundos' })
  expiresIn!: number;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Se true, o login exige confirmar o código de 2FA enviado por e-mail antes de liberar os tokens',
  })
  requiresTwoFactor!: boolean;

  @ApiProperty({
    required: false,
    description: 'Presente somente quando requiresTwoFactor=true. Use com POST /users/2fa/verify',
  })
  challengeId?: string;

  @ApiProperty({ required: false, description: 'Presente somente quando requiresTwoFactor=false' })
  accessToken?: string;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty({ required: false })
  expiresIn?: number;
}
