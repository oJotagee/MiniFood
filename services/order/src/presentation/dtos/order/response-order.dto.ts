import { PaginationResponseDto } from '@miniFood/shared';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
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
}

export class OrderDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  id!: string;

  @ApiProperty({ example: 'CREATED' })
  status!: string;

  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  customerId!: string;

  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  establishmentId!: string;

  @ApiProperty({
    description: 'Itens do pedido',
    type: [OrderItemDto],
  })
  items!: OrderItemDto[];

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class PaginatedOrderResponseDto {
  @ApiProperty({
    description: 'Lista de pedidos',
    type: [OrderDto],
  })
  list!: OrderDto[];

  @ApiProperty({
    description: 'Detalhes da paginação',
    type: PaginationResponseDto,
  })
  pagination!: PaginationResponseDto;
}
