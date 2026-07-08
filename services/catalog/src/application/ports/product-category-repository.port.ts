import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';

export const PRODUCT_CATEGORY_REPOSITORY = Symbol('PRODUCT_CATEGORY_REPOSITORY');

export interface ProductCategoryRepository {
  findAll(establishmentId: string): Promise<ProductCategoryEntity[]>;
  findById(id: string): Promise<ProductCategoryEntity | null>;
  save(category: ProductCategoryEntity): Promise<void>;
  update(category: ProductCategoryEntity): Promise<void>;
}
