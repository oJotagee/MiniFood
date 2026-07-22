import { Inject, Injectable } from '@nestjs/common';

import type { ProductRepository } from '@/application/ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '../../ports/product-repository.port';

type FindAllProductInput = {
  name?: string;
  limit?: number;
  offset?: number;
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

type FindAllProductsOutput = {
  list: ProductsOutput[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: FindAllProductInput): Promise<FindAllProductsOutput> {
    const limit =
      Number.isInteger(input.limit) && input.limit! > 0 ? Math.min(input.limit!, 100) : 10;
    const offset = Number.isInteger(input.offset) && input.offset! > 0 ? input.offset! : 0;

    const { data, total } = await this.productRepository.findAll({
      name: input.name ?? '',
      limit,
      offset,
    });

    return {
      list: data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        isAvailable: product.isAvailable,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
      pagination: {
        page: Math.floor(offset / limit) + 1,
        perPage: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
