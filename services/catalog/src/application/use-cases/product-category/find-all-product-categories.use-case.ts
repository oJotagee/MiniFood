import { Inject, Injectable } from '@nestjs/common';

import type { ProductCategoryRepository } from '../../ports/product-category-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '../../ports/product-category-repository.port';

type FindAllProductCategoriesInput = {
  name?: string;
  establishmentId: string;
  limit?: number;
  offset?: number;
};

type ProductCategoriesOutput = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type FindAllProductCategoriesOutput = {
  list: ProductCategoriesOutput[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class FindAllProductCategoriesUseCase {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,
  ) {}

  async execute(input: FindAllProductCategoriesInput): Promise<FindAllProductCategoriesOutput> {
    const limit =
      Number.isInteger(input.limit) && input.limit! > 0 ? Math.min(input.limit!, 100) : 10;
    const offset = Number.isInteger(input.offset) && input.offset! > 0 ? input.offset! : 0;

    const { data, total } = await this.productCategories.findAll({
      establishmentId: input.establishmentId,
      name: input.name ?? '',
      limit,
      offset,
    });

    return {
      list: data.map((productCategories) => ({
        id: productCategories.id,
        name: productCategories.name,
        createdAt: productCategories.createdAt,
        updatedAt: productCategories.updatedAt,
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
