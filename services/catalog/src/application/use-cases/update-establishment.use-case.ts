import { Inject, Injectable } from '@nestjs/common';

import type { EstablishmentRepository } from '../ports/establishment-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '../ports/establishment-repository.port';
import { Address } from '@/domain/value-objects/address.vo';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

type AddressInput = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

type UpdateEstablishmentInput = {
  id: string;
  requesterId: string;
  name?: string;
  description?: string | null;
  address?: AddressInput;
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

type UpdateEstablishmentOutput = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  address: AddressOutput;
};

@Injectable()
export class UpdateEstablishmentUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: UpdateEstablishmentInput): Promise<UpdateEstablishmentOutput> {
    const establishment = await this.establishments.findById(input.id);

    if (!establishment) throw new EstablishmentNotFoundError(input.id);

    if (establishment.ownerId !== input.requesterId) throw new EstablishmentNotOwnedError(input.id);

    const address = input.address
      ? Address.create({
          street: input.address.street,
          number: input.address.number,
          complement: input.address.complement,
          neighborhood: input.address.neighborhood,
          city: input.address.city,
          state: input.address.state,
          zipCode: input.address.zipCode,
        })
      : undefined;

    const updatedEstablishment = establishment.update({
      name: input.name,
      description: input.description,
      address,
    });

    await this.establishments.update(updatedEstablishment);

    return {
      id: updatedEstablishment.id,
      name: updatedEstablishment.name,
      description: updatedEstablishment.description,
      ownerId: updatedEstablishment.ownerId,
      createdAt: updatedEstablishment.createdAt,
      updatedAt: updatedEstablishment.updatedAt,
      address: updatedEstablishment.address.toJSON(),
    };
  }
}
