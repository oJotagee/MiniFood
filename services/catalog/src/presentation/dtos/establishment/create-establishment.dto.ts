import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({
    description: 'Rua do endereço',
    example: 'Rua das Flores',
  })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto. 101',
    required: false,
  })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({
    description: 'Bairro do endereço',
    example: 'Centro',
  })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({
    description: 'Cidade do endereço',
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    description: 'Estado do endereço',
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({
    description: 'CEP do endereço',
    example: '12345-678',
  })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;
}

export class CreateEstablishmentDto {
  @ApiProperty({
    description: 'Nome do estabelecimento',
    example: 'Restaurante do João',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Descrição do estabelecimento',
    example: 'Restaurante especializado em comida italiana',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Endereço do estabelecimento',
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
