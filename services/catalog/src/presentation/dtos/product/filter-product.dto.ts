import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FilterDto } from '@miniFood/shared';

export class FilterProductDto extends FilterDto {
  @ApiProperty({
    description: 'Nome do produto',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome do produto deve ser uma string' })
  name?: string;
}
