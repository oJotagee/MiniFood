import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Nome do item do pedido',
    example: 'Hamburger',
  })
  @IsString({ message: 'O nome do item deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do item não pode estar vazio' })
  name!: string;

  @ApiProperty({
    description: 'Quantidade do item',
    example: 2,
  })
  @IsNotEmpty({ message: 'A quantidade do item não pode estar vazia' })
  quantity!: number | string;

  @ApiProperty({
    description: 'Preço do item em centavos',
    example: 1500,
  })
  @IsNotEmpty({ message: 'O preço do item não pode estar vazio' })
  priceCents!: bigint | string;

  @ApiProperty({
    description: 'ID do item no catálogo',
    example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a',
  })
  @IsUUID('4', { message: 'O ID do item deve ser um UUID válido' })
  itemId!: string;
}
