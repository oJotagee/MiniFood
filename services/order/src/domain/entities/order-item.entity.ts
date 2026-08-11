
import { Quantity } from '../value-objects/quantity.vo';
import { Money } from '../value-objects/money.vo';
import {
  OrderItemNotFound,
  OrderItemNameCannotBeEmpty,
  ItemIdNotFound,
  OrderIdNotFound,
  OrderItemCannotBeCreatedDirectlyError,
} from '../errors/order-item.errors';

export const ORDER_ITEM_CREATION_TOKEN = Symbol('OrderItemCreationToken');

type OrderItemProps = {
  id: string;
  name: string;
  quantity: Quantity;
  price: Money;
  itemId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrderItemCreateInput = {
  id: string;
  name: string;
  quantity: Quantity;
  price: Money;
  itemId: string;
  orderId: string;
};

type OrderItemUpdateInput = {
  name?: string;
  quantity?: Quantity;
  price?: Money;
};

type OrderItemRestoreInput = {
  id: string;
  name: string;
  quantity: Quantity;
  price: Money;
  itemId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class OrderItemEntity {
  private constructor(private readonly orderItemProps: OrderItemProps) {
    OrderItemEntity.validate(orderItemProps);
  }

  get id(): string {
    return this.orderItemProps.id;
  }

  get name(): string {
    return this.orderItemProps.name;
  }

  get quantity(): Quantity {
    return this.orderItemProps.quantity;
  }

  get quantityString(): string {
    return this.orderItemProps.quantity.toString();
  }

  get price(): Money {
    return this.orderItemProps.price;
  }

  get priceCents(): bigint {
    return this.orderItemProps.price.toCents();
  }

  get itemId(): string {
    return this.orderItemProps.itemId;
  }

  get orderId(): string {
    return this.orderItemProps.orderId;
  }

  get createdAt(): Date {
    return this.orderItemProps.createdAt;
  }

  get updatedAt(): Date {
    return this.orderItemProps.updatedAt;
  }

  static create(input: OrderItemCreateInput, token: typeof ORDER_ITEM_CREATION_TOKEN): OrderItemEntity {
    if (token !== ORDER_ITEM_CREATION_TOKEN) {
      throw new OrderItemCannotBeCreatedDirectlyError();
    }

    const now = new Date();

    const orderItem = new OrderItemEntity({
      id: input.id,
      name: input.name,
      quantity: input.quantity,
      price: input.price,
      itemId: input.itemId,
      orderId: input.orderId,
      createdAt: now,
      updatedAt: now,
    });

    return orderItem;
  }

  static restore(input: OrderItemRestoreInput): OrderItemEntity {
    return new OrderItemEntity({
      id: input.id,
      name: input.name,
      quantity: input.quantity,
      price: input.price,
      itemId: input.itemId,
      orderId: input.orderId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  update(input: OrderItemUpdateInput, token: typeof ORDER_ITEM_CREATION_TOKEN): OrderItemEntity {
    if (token !== ORDER_ITEM_CREATION_TOKEN) {
      throw new OrderItemCannotBeCreatedDirectlyError();
    }

    const now = new Date();

    const orderItem = new OrderItemEntity({
      id: this.id,
      name: input.name ?? this.name,
      quantity: input.quantity ?? this.quantity,
      price: input.price ?? this.price,
      itemId: this.itemId,
      orderId: this.orderId,
      createdAt: this.createdAt,
      updatedAt: now,
    });

    return orderItem;
  }

  private static validate(props: OrderItemProps) {
    if (!props.id.trim()) throw new OrderItemNotFound('Order item not found.');
    if (!props.name.trim())
      throw new OrderItemNameCannotBeEmpty('Order item name cannot be empty.');
    if (!props.itemId.trim()) throw new ItemIdNotFound('Item ID not found.');
    if (!props.orderId.trim()) throw new OrderIdNotFound('Order ID not found.');
  }
}
