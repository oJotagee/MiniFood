import { Inject, Injectable } from '@nestjs/common';

import type { ProductCategoryRepository } from '@/application/ports/product-category-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '@/application/ports/product-category-repository.port';
import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import type { ProductRepository } from '../../ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

type FindProductByIdInput = {
  id: string;
  requesterId: string;
};

type FindProductByIdOutput = {
  id: string;
  name: string;
  description: string | undefined;
  priceCents: bigint;
  isAvailable: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,

    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: FindProductByIdInput): Promise<FindProductByIdOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

    const productCategory = await this.productCategories.findById(product.categoryId);

    if (!productCategory) throw new ProductCategoryNotFoundError(product.categoryId);

    const establishment = await this.establishments.findById(productCategory.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(productCategory.establishmentId);

    if (establishment.ownerId !== input.requesterId)
      throw new EstablishmentNotOwnedError(productCategory.establishmentId);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
