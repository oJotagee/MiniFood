import { Inject, Injectable } from '@nestjs/common';

import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';
import type { EstablishmentRepository } from '../../ports/establishment-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '../../ports/establishment-repository.port';

type AddressOutput = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

type FindEstablishmentByIdOutput = {
  id: string;
  name: string;
  description: string | undefined;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  address: AddressOutput;
};

@Injectable()
export class FindEstablishmentByIdUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute({
    id,
    requesterId,
  }: {
    id: string;
    requesterId: string;
  }): Promise<FindEstablishmentByIdOutput> {
    const establishment = await this.establishments.findById(id);

    if (!establishment) throw new EstablishmentNotFoundError(id);

    if (establishment.ownerId !== requesterId) throw new EstablishmentNotOwnedError(id);

    return {
      id: establishment.id,
      name: establishment.name,
      description: establishment.description,
      ownerId: establishment.ownerId,
      createdAt: establishment.createdAt,
      updatedAt: establishment.updatedAt,
      address: establishment.address.toJSON(),
    };
  }
}
