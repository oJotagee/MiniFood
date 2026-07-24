import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria de produtos',
    example: 'Bebidas',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
