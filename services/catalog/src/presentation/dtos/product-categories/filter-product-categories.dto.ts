import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FilterDto } from '@miniFood/shared';

export class FilterProductCategoriesDto extends FilterDto {
  @ApiProperty({
    description: 'Nome da categoria de produto',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome da categoria de produto deve ser uma string' })
  name?: string;

  @ApiProperty({
    description: 'ID do estabelecimento',
    required: false,
  })
  @IsNotEmpty({ message: 'O ID do estabelecimento não pode estar vazio' })
  @IsUUID('4', { message: 'O ID do estabelecimento deve ser um UUID válido' })
  establishmentId!: string;
}
