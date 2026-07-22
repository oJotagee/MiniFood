import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto {
  @ApiProperty({
    description: 'Número total de itens',
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Número da página atual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 10,
  })
  perPage!: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 10,
  })
  totalPages!: number;
}
