import { Inject, Injectable } from '@nestjs/common';

import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import type { ProductCategoryRepository } from '../../ports/product-category-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '../../ports/product-category-repository.port';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

type UpdateProductCategoryInput = {
  id: string;
  name?: string;
  requesterId: string;
};

type UpdateProductCategoryOutput = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateProductCategoryUseCase {
  constructor(
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly productCategories: ProductCategoryRepository,

    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) { }

  async execute(input: UpdateProductCategoryInput): Promise<UpdateProductCategoryOutput> {
    const productCategory = await this.productCategories.findById(input.id);

    if (!productCategory) throw new ProductCategoryNotFoundError(input.id);

    const establishment = await this.establishments.findById(productCategory.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(productCategory.establishmentId);

    if (establishment.ownerId !== input.requesterId)
      throw new EstablishmentNotOwnedError(productCategory.establishmentId);

    const updatedProductCategory = productCategory.update({
      name: input.name,
    });

    await this.productCategories.update(updatedProductCategory);

    return {
      id: updatedProductCategory.id,
      name: updatedProductCategory.name,
      createdAt: updatedProductCategory.createdAt,
      updatedAt: updatedProductCategory.updatedAt,
    };
  }
}
