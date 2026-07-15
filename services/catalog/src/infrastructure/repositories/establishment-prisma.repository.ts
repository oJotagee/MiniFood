import { Injectable } from '@nestjs/common';

import { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { EstablishmentNotFoundError } from '@/domain/errors/establishment.error';
import { EstablishmentEntity } from '@/domain/entities/establishment.entity';
import { EstablishmentMapper } from '../persistence/establishment.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstablishmentPrismaRepository implements EstablishmentRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findById(id: string): Promise<EstablishmentEntity | null> {
    const establishment = await this.prismaService.establishment.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!establishment) {
      return null;
    }

    return EstablishmentMapper.toDomain(establishment);
  }

  async findAll(params: {
    ownerId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: EstablishmentEntity[]; total: number }> {
    const [establishments, total] = await Promise.all([
      this.prismaService.establishment.findMany({
        where: { ownerId: params.ownerId },
        include: { address: true },
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.establishment.count({
        where: { ownerId: params.ownerId },
      }),
    ]);

    return {
      data: EstablishmentMapper.toDomainList(establishments),
      total,
    };
  }

  async save(establishment: EstablishmentEntity): Promise<void> {
    const persistence = EstablishmentMapper.toPersistence(establishment);

    await this.prismaService.establishment.create({
      data: {
        ...persistence.establishment,
        address: {
          create: persistence.address,
        },
      },
    });
  }

  async update(establishment: EstablishmentEntity): Promise<void> {
    const persistence = EstablishmentMapper.toPersistence(establishment);

    const existing = await this.prismaService.establishment.findUnique({
      where: { id: establishment.id },
      select: { id: true },
    });

    if (!existing) throw new EstablishmentNotFoundError(establishment.id);

    await this.prismaService.establishment.update({
      where: { id: establishment.id },
      data: {
        name: persistence.establishment.name,
        description: persistence.establishment.description,
        address: {
          upsert: {
            create: persistence.address,
            update: persistence.address,
          },
        },
      },
    });
  }
}
