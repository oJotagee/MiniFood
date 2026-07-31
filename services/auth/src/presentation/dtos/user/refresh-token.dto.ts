import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token emitido no login',
  })
  @IsString({ message: 'O refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'O refresh token não pode estar vazio' })
  refreshToken!: string;
}
