import { Inject, Injectable } from '@nestjs/common';

import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import type { ProductCategoryRepository } from '../../ports/product-category-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '../../ports/product-category-repository.port';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

type FindProductCategoryByIdInput = {
  id: string;
  requesterId: string;
};

type FindProductCategoryByIdOutput = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindProductCategoryByIdUseCase {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: FindProductCategoryByIdInput): Promise<FindProductCategoryByIdOutput> {
    const productCategory = await this.productCategories.findById(input.id);

    if (!productCategory) throw new ProductCategoryNotFoundError(input.id);

    const establishment = await this.establishments.findById(productCategory.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(productCategory.establishmentId);

    if (establishment.ownerId !== input.requesterId)
      throw new EstablishmentNotOwnedError(productCategory.establishmentId);

    return {
      id: productCategory.id,
      name: productCategory.name,
      createdAt: productCategory.createdAt,
      updatedAt: productCategory.updatedAt,
    };
  }
}
