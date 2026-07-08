import { EstablishmentEntity } from '@/domain/entities/establishment.entity';

export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface EstablishmentRepository {
  findById(id: string): Promise<EstablishmentEntity | null>;
  findAllByOwnerId(ownerId: string): Promise<EstablishmentEntity[]>;
  save(establishment: EstablishmentEntity): Promise<void>;
  update(establishment: EstablishmentEntity): Promise<void>;
}
