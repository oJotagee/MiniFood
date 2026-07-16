import type { ProductCategoryRepository } from '@/application/ports/product-category-repository.port';
import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';

export class InMemoryProductCategoryRepository implements ProductCategoryRepository {
  private readonly categories = new Map<string, ProductCategoryEntity>();

  async findById(id: string): Promise<ProductCategoryEntity | null> {
    return this.categories.get(id) ?? null;
  }

  async findAll(params: {
    name: string;
    establishmentId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: ProductCategoryEntity[]; total: number }> {
    const all = [...this.categories.values()].filter(
      (category) =>
        category.establishmentId === params.establishmentId && category.name.includes(params.name),
    );

    return {
      data: all.slice(params.offset, params.offset + params.limit),
      total: all.length,
    };
  }

  async save(category: ProductCategoryEntity): Promise<void> {
    this.categories.set(category.id, category);
  }

  async update(category: ProductCategoryEntity): Promise<void> {
    this.categories.set(category.id, category);
  }
}
