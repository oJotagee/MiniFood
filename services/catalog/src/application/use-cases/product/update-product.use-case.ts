import { Inject, Injectable } from '@nestjs/common';

import type { ProductRepository } from '../../ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { Money } from '@/domain/value-objects/money.vo';

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
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

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
}
