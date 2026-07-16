import { Inject, Injectable } from '@nestjs/common';

import type { ProductCategoryRepository } from '../../ports/product-category-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '../../ports/product-category-repository.port';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';

type FindProductCategoryByIdOutput = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindProductCategoryByIdUseCase {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,
  ) {}

  async execute(input: { id: string }): Promise<FindProductCategoryByIdOutput> {
    const productCategory = await this.productCategories.findById(input.id);

    if (!productCategory) throw new ProductCategoryNotFoundError(input.id);

    return {
      id: productCategory.id,
      name: productCategory.name,
      createdAt: productCategory.createdAt,
      updatedAt: productCategory.updatedAt,
    };
  }
}
