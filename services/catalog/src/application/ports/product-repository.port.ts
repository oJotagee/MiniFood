import { ProductEntity } from '@/domain/entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findAll(establishmentId: string): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  save(product: ProductEntity): Promise<void>;
  update(product: ProductEntity): Promise<void>;
  desactivate(product: ProductEntity): Promise<void>;
}
