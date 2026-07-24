import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria de produtos',
    example: 'Bebidas',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'ID do estabelecimento',
    example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a',
  })
  @IsNotEmpty({ message: 'O ID do estabelecimento não pode estar vazio' })
  @IsUUID('4', { message: 'O ID do estabelecimento deve ser um UUID válido' })
  establishmentId!: string;
}
