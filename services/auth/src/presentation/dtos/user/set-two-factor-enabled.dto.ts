import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetTwoFactorEnabledDto {
  @ApiProperty({
    description: 'Ativa ou desativa a autenticação de dois fatores por e-mail para o usuário',
    example: true,
  })
  @IsBoolean({ message: 'O campo enabled deve ser um booleano' })
  enabled!: boolean;
}
