import { Inject, Injectable } from '@nestjs/common';

import type { ProductRepository } from '../../ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { Money } from '@/domain/value-objects/money.vo';

type DesactivateProductInput = {
  id: string;
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
  ) {}

  async execute(input: DesactivateProductInput): Promise<DesactivateProductOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

    await this.products.desactivate(input.id);

    const updatedProduct = await this.products.findById(input.id);

    if (!updatedProduct) throw new ProductNotFoundError(input.id);

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
}
