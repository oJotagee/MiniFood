import { Inject, Injectable } from '@nestjs/common';

import type { ProductCategoryRepository } from '@/application/ports/product-category-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '@/application/ports/product-category-repository.port';
import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import type { ProductRepository } from '../../ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { Money } from '@/domain/value-objects/money.vo';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

type UpdateProductInput = {
  id: string;
  name?: string;
  description?: string | undefined;
  priceCents?: Money;
  categoryId?: string;
  requesterId: string;
};

type UpdateProductOutput = {
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
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,

    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

    await this.ensureOwnership(product.categoryId, input.requesterId);

    if (input.categoryId && input.categoryId !== product.categoryId) {
      await this.ensureOwnership(input.categoryId, input.requesterId);
    }

    const updatedProduct = product.update({
      name: input.name,
      description: input.description,
      price: input.priceCents,
      categoryId: input.categoryId,
    });

    await this.products.update(updatedProduct);

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      priceCents: updatedProduct.priceCents,
      isAvailable: updatedProduct.isAvailable,
      categoryId: updatedProduct.categoryId,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  }

  private async ensureOwnership(categoryId: string, requesterId: string): Promise<void> {
    const productCategory = await this.productCategories.findById(categoryId);

    if (!productCategory) throw new ProductCategoryNotFoundError(categoryId);

    const establishment = await this.establishments.findById(productCategory.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(productCategory.establishmentId);

    if (establishment.ownerId !== requesterId)
      throw new EstablishmentNotOwnedError(productCategory.establishmentId);
  }
}
