import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { EstablishmentEntity } from '@/domain/entities/establishment.entity';

export class InMemoryEstablishmentRepository implements EstablishmentRepository {
  private readonly establishments = new Map<string, EstablishmentEntity>();

  async findById(id: string): Promise<EstablishmentEntity | null> {
    return this.establishments.get(id) ?? null;
  }

  async findAll(params: {
    ownerId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: EstablishmentEntity[]; total: number }> {
    const all = [...this.establishments.values()].filter(
      (establishment) => establishment.ownerId === params.ownerId,
    );

    return {
      data: all.slice(params.offset, params.offset + params.limit),
      total: all.length,
    };
  }

  async save(establishment: EstablishmentEntity): Promise<void> {
    this.establishments.set(establishment.id, establishment);
  }

  async update(establishment: EstablishmentEntity): Promise<void> {
    this.establishments.set(establishment.id, establishment);
  }
}
