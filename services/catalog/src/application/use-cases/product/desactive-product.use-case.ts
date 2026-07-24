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

type DesactivateProductInput = {
  id: string;
  requesterId: string;
};

type DesactivateProductOutput = {
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
export class DesactivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,

    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: DesactivateProductInput): Promise<DesactivateProductOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

    const productCategory = await this.productCategories.findById(product.categoryId);

    if (!productCategory) throw new ProductCategoryNotFoundError(product.categoryId);

    const establishment = await this.establishments.findById(productCategory.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(productCategory.establishmentId);

    if (establishment.ownerId !== input.requesterId)
      throw new EstablishmentNotOwnedError(productCategory.establishmentId);

    const deactivatedProduct = product.deactivate();

    await this.products.update(deactivatedProduct);

    return {
      id: deactivatedProduct.id,
      name: deactivatedProduct.name,
      description: deactivatedProduct.description,
      priceCents: deactivatedProduct.priceCents,
      isAvailable: deactivatedProduct.isAvailable,
      categoryId: deactivatedProduct.categoryId,
      createdAt: deactivatedProduct.createdAt,
      updatedAt: deactivatedProduct.updatedAt,
    };
  }
}
