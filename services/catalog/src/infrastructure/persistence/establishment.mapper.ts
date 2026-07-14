import { EstablishmentEntity } from '@/domain/entities/establishment.entity';
import { Address } from '@/domain/value-objects/address.vo';

type EstablishmentPersistence = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  address: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
};

export class EstablishmentMapper {
  static toDomain(raw: EstablishmentPersistence): EstablishmentEntity {
    if (!raw.address) {
      throw new Error('Establishment address not found');
    }

    return EstablishmentEntity.restore({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      ownerId: raw.ownerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      address: Address.create({
        street: raw.address.street,
        number: raw.address.number,
        complement: raw.address.complement ?? undefined,
        neighborhood: raw.address.neighborhood,
        city: raw.address.city,
        state: raw.address.state,
        zipCode: raw.address.zipCode,
      }),
    });
  }

  static toDomainList(rawList: EstablishmentPersistence[]): EstablishmentEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(establishment: EstablishmentEntity) {
    return {
      establishment: {
        id: establishment.id,
        name: establishment.name,
        description: establishment.description ?? null,
        ownerId: establishment.ownerId,
        createdAt: establishment.createdAt,
        updatedAt: establishment.updatedAt,
      },
      address: {
        street: establishment.address.street,
        number: establishment.address.number,
        complement: establishment.address.complement ?? null,
        neighborhood: establishment.address.neighborhood,
        city: establishment.address.city,
        state: establishment.address.state,
        zipCode: establishment.address.zipCode,
      },
    };
  }
}
