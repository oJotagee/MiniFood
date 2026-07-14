import { InvalidProductCategoryError } from '../errors/product-category.errors';
import { ProductCategoryCreatedEvent } from '../events/product-category-created.event';
import { ProductCategoryUpdatedEvent } from '../events/product-category-updated.event';

export type ProductCategoryDomainEvent = ProductCategoryCreatedEvent | ProductCategoryUpdatedEvent;

type ProductCategoryProps = {
  id: string;
  name: string;
  establishmentId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProductCategoryCreateInput = {
  id: string;
  operationId: string;
  name: string;
  establishmentId: string;
};

type ProductCategoryUpdateInput = {
  operationId: string;
  name?: string;
};

type ProductCategoryRestoreInput = {
  id: string;
  name: string;
  establishmentId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductCategoryEntity {
  private readonly domainEvents: ProductCategoryDomainEvent[] = [];

  private constructor(private readonly props: ProductCategoryProps) {
    ProductCategoryEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get establishmentId(): string {
    return this.props.establishmentId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: ProductCategoryCreateInput): ProductCategoryEntity {
    const now = new Date();

    const category = new ProductCategoryEntity({
      id: input.id,
      name: input.name.trim(),
      establishmentId: input.establishmentId,
      createdAt: now,
      updatedAt: now,
    });

    category.recordDomainEvent({
      type: 'product.category.created',
      occurredAt: now,
      payload: {
        operationId: input.operationId,
        categoryId: category.id,
        establishmentId: category.establishmentId,
        name: category.name,
      },
    });

    return category;
  }

  static restore(input: ProductCategoryRestoreInput): ProductCategoryEntity {
    return new ProductCategoryEntity({
      id: input.id,
      name: input.name.trim(),
      establishmentId: input.establishmentId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  update(input: ProductCategoryUpdateInput): ProductCategoryEntity {
    const now = new Date();

    const category = new ProductCategoryEntity({
      id: this.id,
      name: input.name?.trim() ?? this.name,
      establishmentId: this.establishmentId,
      createdAt: this.createdAt,
      updatedAt: now,
    });

    category.recordDomainEvent({
      type: 'product.category.updated',
      occurredAt: now,
      payload: {
        operationId: input.operationId,
        categoryId: category.id,
        establishmentId: category.establishmentId,
        name: category.name,
      },
    });

    return category;
  }

  private static validate(props: ProductCategoryProps): void {
    if (!props.id.trim()) throw new InvalidProductCategoryError('Category id must be provided.');
    if (!props.name.trim())
      throw new InvalidProductCategoryError('Category name must be provided.');
    if (!props.establishmentId.trim()) {
      throw new InvalidProductCategoryError('Establishment id must be provided.');
    }
  }

  private recordDomainEvent(event: ProductCategoryDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): ProductCategoryDomainEvent[] {
    return this.domainEvents.splice(0, this.domainEvents.length);
  }
}
