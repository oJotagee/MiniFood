import { PaginationResponseDto } from '@miniFood/shared';
import { ApiProperty } from '@nestjs/swagger';

import { OrderApprovalStatus } from '@/domain/entities/order-approval.entity';

export class OrderApprovalItemDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  itemId!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: '1500' })
  priceCents!: string;
}

export class OrderApprovalDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  orderId!: string;

  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  establishmentId!: string;

  @ApiProperty({ enum: OrderApprovalStatus, example: OrderApprovalStatus.PENDING })
  status!: OrderApprovalStatus;

  @ApiProperty({ type: [OrderApprovalItemDto] })
  items!: OrderApprovalItemDto[];

  @ApiProperty({ required: false, example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  decidedBy?: string;

  @ApiProperty({ required: false, example: '2023-01-01T00:00:00Z' })
  decidedAt?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class PaginatedOrderApprovalResponseDto {
  @ApiProperty({ description: 'Lista de aprovações de pedido', type: [OrderApprovalDto] })
  list!: OrderApprovalDto[];

  @ApiProperty({ description: 'Detalhes da paginação', type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}
