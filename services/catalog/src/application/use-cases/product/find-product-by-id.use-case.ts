import { Inject, Injectable } from '@nestjs/common';

import type { ProductRepository } from '../../ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';
import { ProductNotFoundError } from '@/domain/errors/product.errors';

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
  ) {}

  async execute(input: { id: string }): Promise<FindProductByIdOutput> {
    const product = await this.products.findById(input.id);

    if (!product) throw new ProductNotFoundError(input.id);

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
