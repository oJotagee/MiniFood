import { ProductEntity } from '@/domain/entities/product.entity';
import { Money } from '@/domain/value-objects/money.vo';

type ProductPersistence = {
  id: string;
  name: string;
  description: string | null;
  priceCents: bigint;
  isAvailable: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductMapper {
  static toDomain(raw: ProductPersistence): ProductEntity {
    return ProductEntity.restore({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      price: Money.fromCents(raw.priceCents),
      isAvailable: raw.isAvailable,
      categoryId: raw.categoryId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainList(rawList: ProductPersistence[]): ProductEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(product: ProductEntity): ProductPersistence {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      priceCents: product.price.toCents(),
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
