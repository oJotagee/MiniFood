import { InvalidProductError, ProductAlreadyDeactivatedError } from './product.errors';
import { ProductDeactivatedEvent } from '../events/product-deactivated.event';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { Money } from '../value-objects/money.vo';

export type ProductDomainEvent =
  | ProductCreatedEvent
  | ProductDeactivatedEvent
  | ProductUpdatedEvent;

type ProductProps = {
  id: string;
  name: string;
  description?: string;
  establishmentId: string;
  price: Money;
  isAvailable: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProductCreateInput = {
  id: string;
  operationId: string;
  name: string;
  establishmentId: string;
  description?: string;
  price: Money;
  isAvailable?: boolean;
  categoryId: string;
};

type ProductUpdateInput = {
  operationId: string;
  name?: string;
  description?: string;
  price?: Money;
  categoryId?: string;
};

type ProductRestoreInput = {
  id: string;
  name: string;
  establishmentId: string;
  description?: string;
  price: Money;
  isAvailable: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProductDeactivateInput = {
  operationId: string;
};

export class ProductEntity {
  private readonly domainEvents: ProductDomainEvent[] = [];

  private constructor(private readonly productProps: ProductProps) {
    ProductEntity.validate(productProps);
  }

  get id(): string {
    return this.productProps.id;
  }

  get name(): string {
    return this.productProps.name;
  }

  get description(): string | undefined {
    return this.productProps.description;
  }

  get establishmentId(): string {
    return this.productProps.establishmentId;
  }

  get price(): Money {
    return this.productProps.price;
  }

  get priceCents(): bigint {
    return this.productProps.price.toCents();
  }

  get isAvailable(): boolean {
    return this.productProps.isAvailable;
  }

  get categoryId(): string {
    return this.productProps.categoryId;
  }

  get createdAt(): Date {
    return this.productProps.createdAt;
  }

  get updatedAt(): Date {
    return this.productProps.updatedAt;
  }

  static create(input: ProductCreateInput): ProductEntity {
    const now = new Date();

    const product = new ProductEntity({
      id: input.id,
      name: input.name.trim(),
      establishmentId: input.establishmentId,
      description: input.description?.trim() || undefined,
      price: input.price,
      isAvailable: input.isAvailable ?? true,
      categoryId: input.categoryId,
      createdAt: now,
      updatedAt: now,
    });

    product.recordDomainEvent({
      type: 'product.created',
      occurredAt: now,
      payload: {
        operationId: input.operationId,
        productId: product.id,
        establishmentId: product.establishmentId,
        productCategoryId: input.categoryId,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents.toString(),
        isAvailable: product.isAvailable,
      },
    });

    return product;
  }

  static restore(input: ProductRestoreInput): ProductEntity {
    return new ProductEntity({
      id: input.id,
      name: input.name.trim(),
      establishmentId: input.establishmentId,
      description: input.description?.trim() || undefined,
      price: input.price,
      isAvailable: input.isAvailable,
      categoryId: input.categoryId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  update(input: ProductUpdateInput): ProductEntity {
    const now = new Date();

    const product = new ProductEntity({
      id: this.id,
      name: input.name ?? this.name,
      description: input.description || this.description,
      establishmentId: this.establishmentId,
      price: input.price ?? this.price,
      isAvailable: this.isAvailable,
      categoryId: input.categoryId ?? this.categoryId,
      createdAt: this.createdAt,
      updatedAt: now,
    });

    product.recordDomainEvent({
      type: 'product.updated',
      occurredAt: now,
      payload: {
        operationId: input.operationId,
        establishmentId: product.establishmentId,
        productId: this.id,
        productCategoryId: product.categoryId,
        name: product.name,
        description: product.description,
        priceCents: product.price.toCents().toString(),
        isAvailable: product.isAvailable,
      },
    });

    return product;
  }

  deactivate(props: ProductDeactivateInput): ProductEntity {
    if (!this.isAvailable) throw new ProductAlreadyDeactivatedError(this.id);

    const now = new Date();

    const product = new ProductEntity({
      id: this.id,
      name: this.name,
      description: this.description,
      establishmentId: this.establishmentId,
      price: this.price,
      isAvailable: false,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
      updatedAt: now,
    });

    product.recordDomainEvent({
      type: 'product.deactivated',
      occurredAt: now,
      payload: {
        operationId: props.operationId,
        establishmentId: product.establishmentId,
        productId: this.id,
      },
    });

    return product;
  }

  private static validate(props: ProductProps): void {
    if (!props.id.trim()) throw new InvalidProductError('Product id must be provided.');
    if (!props.name.trim()) throw new InvalidProductError('Product name must be provided.');
    if (!props.establishmentId.trim())
      throw new InvalidProductError('Establishment id must be provided.');
    if (!props.categoryId.trim())
      throw new InvalidProductError('Product category id must be provided.');
  }

  private recordDomainEvent(event: ProductDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): ProductDomainEvent[] {
    return this.domainEvents.splice(0, this.domainEvents.length);
  }
}
