import { PaginationResponseDto } from '@miniFood/shared';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  id!: string;

  @ApiProperty({ example: 'Hamburger' })
  name!: string;

  @ApiProperty({ example: '2' })
  quantity!: string;

  @ApiProperty({ example: '15.00' })
  price!: string;

  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  itemId!: string;

  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  orderId!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class PaginatedOrderItemResponseDto {
  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [OrderItemResponseDto],
  })
  list!: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Detalhes da paginação',
    type: PaginationResponseDto,
  })
  pagination!: PaginationResponseDto;
}
