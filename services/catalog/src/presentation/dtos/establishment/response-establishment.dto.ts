import { PaginationResponseDto } from '@miniFood/shared';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({ example: '123 Main St' })
  street!: string;

  @ApiProperty({ example: '123' })
  number!: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  complement?: string;

  @ApiProperty({ example: 'Downtown' })
  neighborhood!: string;

  @ApiProperty({ example: 'New York' })
  city!: string;

  @ApiProperty({ example: 'NY' })
  state!: string;

  @ApiProperty({ example: '10001' })
  zipCode!: string;
}

export class EstablishmentDto {
  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  id!: string;

  @ApiProperty({ example: 'My Establishment' })
  name!: string;

  @ApiProperty({ example: 'A great place to eat' })
  description?: string;

  @ApiProperty({ example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a' })
  ownerId!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;

  @ApiProperty({ type: AddressDto })
  address!: AddressDto;
}

export class PaginatedEstablishmentResponseDto {
  @ApiProperty({
    description: 'Lista de estabelecimentos',
    type: [EstablishmentDto],
  })
  list!: EstablishmentDto[];

  @ApiProperty({
    description: 'Detalhes da paginação',
    type: PaginationResponseDto,
  })
  pagination!: PaginationResponseDto;
}
