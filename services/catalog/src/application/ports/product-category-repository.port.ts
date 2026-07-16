import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';

export const PRODUCT_CATEGORY_REPOSITORY = Symbol('PRODUCT_CATEGORY_REPOSITORY');

export interface ProductCategoryRepository {
  findAll(params: {
    name: string;
    establishmentId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: ProductCategoryEntity[]; total: number }>;
  findById(id: string): Promise<ProductCategoryEntity | null>;
  save(category: ProductCategoryEntity): Promise<void>;
  update(category: ProductCategoryEntity): Promise<void>;
}
