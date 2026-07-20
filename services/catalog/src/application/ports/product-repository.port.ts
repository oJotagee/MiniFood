import { ProductEntity } from '@/domain/entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findAll(params: {
    name: string;
    limit: number;
    offset: number;
  }): Promise<{ data: ProductEntity[]; total: number }>;
  findById(id: string): Promise<ProductEntity | null>;
  save(product: ProductEntity): Promise<void>;
  update(product: ProductEntity): Promise<void>;
  desactivate(id: string): Promise<void>;
}
