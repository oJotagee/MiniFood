import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Refrigerante',
  })
  @IsString({ message: 'O nome do produto deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do produto não pode estar vazio' })
  name!: string;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Refrigerante sabor cola',
  })
  @IsOptional()
  @IsString({ message: 'A descrição do produto deve ser uma string' })
  description?: string;

  @ApiProperty({
    description: 'Preço do produto em centavos',
    example: 1000,
  })
  @IsNotEmpty({ message: 'O preço do produto não pode estar vazio' })
  @IsNotEmpty({ message: 'O preço do produto não pode estar vazio' })
  @IsOptional()
  priceCents!: bigint;

  @ApiProperty({
    description: 'ID da categoria do produto',
    example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a',
  })
  @IsUUID('4', { message: 'O ID da categoria do produto deve ser um UUID válido' })
  categoryId!: string;
}
