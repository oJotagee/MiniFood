import { Inject, Injectable } from '@nestjs/common';

import type { EstablishmentRepository } from '../../ports/establishment-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '../../ports/establishment-repository.port';
import { EstablishmentEntity } from '@/domain/entities/establishment.entity';
import { Address } from '@/domain/value-objects/address.vo';

type AddressInput = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
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

type CreateEstablishmentInput = {
  name: string;
  description?: string | null;
  ownerId: string;
  address: AddressInput;
};

type CreateEstablishmentOutput = {
  id: string;
  name: string;
  description: string | undefined;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  address: AddressOutput;
};

@Injectable()
export class CreateEstablishmentUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: CreateEstablishmentInput): Promise<CreateEstablishmentOutput> {
    const address = Address.create({
      street: input.address.street,
      number: input.address.number,
      complement: input.address.complement ?? undefined,
      neighborhood: input.address.neighborhood,
      city: input.address.city,
      state: input.address.state,
      zipCode: input.address.zipCode,
    });

    const establishment = EstablishmentEntity.create({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description ?? undefined,
      ownerId: input.ownerId,
      address: address,
    });

    await this.establishments.save(establishment);

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
