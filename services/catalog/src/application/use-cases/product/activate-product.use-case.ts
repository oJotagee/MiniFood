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

type ActivateProductInput = {
  id: string;
  requesterId: string;
};

type ActivateProductOutput = {
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
export class ActivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,

    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: ActivateProductInput): Promise<ActivateProductOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

    const productCategory = await this.productCategories.findById(product.categoryId);

    if (!productCategory) throw new ProductCategoryNotFoundError(product.categoryId);

    const establishment = await this.establishments.findById(productCategory.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(productCategory.establishmentId);

    if (establishment.ownerId !== input.requesterId)
      throw new EstablishmentNotOwnedError(productCategory.establishmentId);

    const activatedProduct = product.activate();

    await this.products.update(activatedProduct);

    return {
      id: activatedProduct.id,
      name: activatedProduct.name,
      description: activatedProduct.description,
      priceCents: activatedProduct.priceCents,
      isAvailable: activatedProduct.isAvailable,
      categoryId: activatedProduct.categoryId,
      createdAt: activatedProduct.createdAt,
      updatedAt: activatedProduct.updatedAt,
    };
  }
}
