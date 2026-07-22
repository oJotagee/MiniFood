import { Inject, Injectable } from '@nestjs/common';

import type { ProductRepository } from '../../ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';
import { ProductEntity } from '@/domain/entities/product.entity';
import { Money } from '@/domain/value-objects/money.vo';

type CreateProductInput = {
  name: string;
  description: string | undefined;
  priceCents: Money;
  categoryId: string;
  requesterId: string;
};

type ProductsOutput = {
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
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<ProductsOutput> {
    const product = ProductEntity.create({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      price: input.priceCents,
      categoryId: input.categoryId,
    });

    await this.products.save(product);

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
