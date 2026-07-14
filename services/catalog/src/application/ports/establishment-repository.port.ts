import { EstablishmentEntity } from '@/domain/entities/establishment.entity';

export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface EstablishmentRepository {
  findById(id: string): Promise<EstablishmentEntity | null>;
  findAll(params: { ownerId: string; limit: number; offset: number }): Promise<{
    data: EstablishmentEntity[];
    total: number;
  }>;
  save(establishment: EstablishmentEntity): Promise<void>;
  update(establishment: EstablishmentEntity): Promise<void>;
}
