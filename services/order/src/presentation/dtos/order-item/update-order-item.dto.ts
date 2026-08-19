import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderItemDto {
  @ApiProperty({
    description: 'Nome do item do pedido',
    example: 'Veggie hamburger',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome do item deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do item não pode estar vazio' })
  name?: string;

  @ApiProperty({
    description: 'Quantidade do item',
    example: 3,
    required: false,
  })
  @IsOptional()
  quantity?: number | string;

  @ApiProperty({
    description: 'Preço do item em centavos',
    example: 1800,
    required: false,
  })
  @IsOptional()
  priceCents?: bigint | string;
}
