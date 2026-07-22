import { Injectable } from '@nestjs/common';

import { ProductRepository } from '@/application/ports/product-repository.port';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { ProductEntity } from '@/domain/entities/product.entity';
import { ProductMapper } from '../persistence/product.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    return ProductMapper.toDomain(product);
  }

  async findAll(params: {
    name: string;
    limit: number;
    offset: number;
  }): Promise<{ data: ProductEntity[]; total: number }> {
    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        where: {
          name: { contains: params.name },
        },
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.product.count({
        where: {
          name: { contains: params.name },
        },
      }),
    ]);

    return {
      data: ProductMapper.toDomainList(products),
      total,
    };
  }

  async save(product: ProductEntity): Promise<void> {
    const persistence = ProductMapper.toPersistence(product);

    await this.prismaService.product.create({
      data: persistence,
    });
  }

  async update(product: ProductEntity): Promise<void> {
    const persistence = ProductMapper.toPersistence(product);

    const existing = await this.prismaService.product.findUnique({
      where: { id: persistence.id },
    });

    if (!existing) throw new ProductNotFoundError(product.id);

    await this.prismaService.product.update({
      where: { id: persistence.id },
      data: persistence,
    });
  }

  async desactivate(id: string): Promise<void> {
    const existing = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!existing) throw new ProductNotFoundError(id);

    await this.prismaService.product.update({
      where: { id },
      data: { isAvailable: false },
    });
  }
}
