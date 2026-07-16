import { Inject, Injectable } from '@nestjs/common';

import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import type { ProductCategoryRepository } from '../../ports/product-category-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '../../ports/product-category-repository.port';
import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

type CreateProductCategoryInput = {
  name: string;
  establishmentId: string;
  requesterId: string;
};

type CreateProductCategoryOutput = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateProductCategoryUseCase {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: CreateProductCategoryInput): Promise<CreateProductCategoryOutput> {
    const establishment = await this.establishments.findById(input.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(input.establishmentId);

    if (establishment.ownerId !== input.requesterId)
      throw new EstablishmentNotOwnedError(input.establishmentId);

    const productCategory = ProductCategoryEntity.create({
      id: crypto.randomUUID(),
      name: input.name,
      establishmentId: input.establishmentId,
    });

    await this.productCategories.save(productCategory);

    return {
      id: productCategory.id,
      name: productCategory.name,
      createdAt: productCategory.createdAt,
      updatedAt: productCategory.updatedAt,
    };
  }
}
