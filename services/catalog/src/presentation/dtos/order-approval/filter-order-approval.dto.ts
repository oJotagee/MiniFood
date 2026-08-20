import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FilterDto } from '@miniFood/shared';

import { OrderApprovalStatus } from '@/domain/entities/order-approval.entity';

export class FilterOrderApprovalDto extends FilterDto {
  @ApiProperty({
    description: 'Status da aprovação',
    required: false,
    enum: OrderApprovalStatus,
    example: OrderApprovalStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderApprovalStatus, { message: 'Status inválido' })
  status?: OrderApprovalStatus;
}
