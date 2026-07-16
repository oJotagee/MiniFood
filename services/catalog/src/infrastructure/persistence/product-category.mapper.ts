import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';

type ProductCategoryPersistence = {
  id: string;
  name: string;
  establishmentId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductCategoryMapper {
  static toDomain(raw: ProductCategoryPersistence): ProductCategoryEntity {
    return ProductCategoryEntity.restore({
      id: raw.id,
      name: raw.name,
      establishmentId: raw.establishmentId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainList(rawList: ProductCategoryPersistence[]): ProductCategoryEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(productCategory: ProductCategoryEntity): ProductCategoryPersistence {
    return {
      id: productCategory.id,
      name: productCategory.name,
      establishmentId: productCategory.establishmentId,
      createdAt: productCategory.createdAt,
      updatedAt: productCategory.updatedAt,
    };
  }
}
