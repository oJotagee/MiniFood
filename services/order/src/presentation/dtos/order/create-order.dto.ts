import { ArrayNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID do estabelecimento dono do pedido',
    example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a',
  })
  @IsUUID('4', { message: 'O ID do estabelecimento deve ser um UUID válido' })
  establishmentId!: string;

  @ApiProperty({
    description: 'Itens do pedido',
    type: [CreateOrderItemDto],
  })
  @ArrayNotEmpty({ message: 'O pedido deve conter ao menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
