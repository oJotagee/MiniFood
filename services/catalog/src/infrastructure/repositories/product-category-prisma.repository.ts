import { Injectable } from '@nestjs/common';

import { ProductCategoryRepository } from '@/application/ports/product-category-repository.port';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';
import { ProductCategoryMapper } from '../persistence/product-category.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductCategoryPrismaRepository implements ProductCategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<ProductCategoryEntity | null> {
    const productCategory = await this.prismaService.productCategory.findUnique({
      where: { id },
    });

    if (!productCategory) {
      return null;
    }

    return ProductCategoryMapper.toDomain(productCategory);
  }

  async findAll(params: {
    name: string;
    establishmentId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: ProductCategoryEntity[]; total: number }> {
    const [productCategories, total] = await Promise.all([
      this.prismaService.productCategory.findMany({
        where: {
          name: { contains: params.name },
          establishmentId: params.establishmentId,
        },
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.productCategory.count({
        where: {
          name: { contains: params.name },
          establishmentId: params.establishmentId,
        },
      }),
    ]);

    return {
      data: ProductCategoryMapper.toDomainList(productCategories),
      total,
    };
  }

  async save(category: ProductCategoryEntity): Promise<void> {
    const persistence = ProductCategoryMapper.toPersistence(category);

    await this.prismaService.productCategory.create({
      data: persistence,
    });
  }

  async update(productCategory: ProductCategoryEntity): Promise<void> {
    const persistence = ProductCategoryMapper.toPersistence(productCategory);

    const existing = await this.prismaService.productCategory.findUnique({
      where: { id: persistence.id },
    });

    if (!existing) throw new ProductCategoryNotFoundError(productCategory.id);

    await this.prismaService.productCategory.update({
      where: { id: persistence.id },
      data: persistence,
    });
  }
}
