import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterDto {
  @ApiProperty({
    description: 'Limite de registros a serem buscados',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser no mínimo 1' })
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Número de registros a serem pulados',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O offset deve ser um número inteiro' })
  @Min(0, { message: 'O offset deve ser no mínimo 0' })
  @Type(() => Number)
  offset?: number;
}
