import type { ProductRepository } from '@/application/ports/product-repository.port';
import { ProductEntity } from '@/domain/entities/product.entity';

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, ProductEntity>();

  async findById(id: string): Promise<ProductEntity | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(params: {
    name: string;
    limit: number;
    offset: number;
  }): Promise<{ data: ProductEntity[]; total: number }> {
    const all = [...this.products.values()].filter((product) =>
      product.name.includes(params.name),
    );

    return {
      data: all.slice(params.offset, params.offset + params.limit),
      total: all.length,
    };
  }

  async save(product: ProductEntity): Promise<void> {
    this.products.set(product.id, product);
  }

  async update(product: ProductEntity): Promise<void> {
    this.products.set(product.id, product);
  }

  async desactivate(id: string): Promise<void> {
    const product = this.products.get(id);
    if (!product) return;
    this.products.set(id, product.deactivate());
  }
}
