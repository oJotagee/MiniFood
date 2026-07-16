import { Inject, Injectable } from '@nestjs/common';

import type { EstablishmentRepository } from '../../ports/establishment-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '../../ports/establishment-repository.port';

type FindAllEstablishmentsInput = {
  ownerId: string;
  limit?: number;
  offset?: number;
};

type AddressOutput = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

type EstablishmentOutput = {
  id: string;
  name: string;
  description: string | undefined;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  address: AddressOutput;
};

type FindAllEstablishmentsOutput = {
  list: EstablishmentOutput[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class FindAllEstablishmentsUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: FindAllEstablishmentsInput): Promise<FindAllEstablishmentsOutput> {
    const limit =
      Number.isInteger(input.limit) && input.limit! > 0 ? Math.min(input.limit!, 100) : 10;
    const offset = Number.isInteger(input.offset) && input.offset! > 0 ? input.offset! : 0;

    const { data, total } = await this.establishments.findAll({
      ownerId: input.ownerId,
      limit,
      offset,
    });

    return {
      list: data.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        description: establishment.description,
        ownerId: establishment.ownerId,
        createdAt: establishment.createdAt,
        updatedAt: establishment.updatedAt,
        address: establishment.address.toJSON(),
      })),
      pagination: {
        page: Math.floor(offset / limit) + 1,
        perPage: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
