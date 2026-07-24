import { PaginationResponseDto } from '@miniFood/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  id!: string;

  @ApiProperty({ example: 'My Establishment' })
  name!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class PaginatedProductCategoryResponseDto {
  @ApiProperty({
    description: 'Lista de categorias de produtos ',
    type: [ProductCategoryDto],
  })
  list!: ProductCategoryDto[];

  @ApiProperty({
    description: 'Detalhes da paginação',
    type: PaginationResponseDto,
  })
  pagination!: PaginationResponseDto;
}
