import { OrderItemDoesNotBelongToOrderError } from '../errors/order-item.errors';
import { OrderCancelledEvent } from '../events/order-cancelled.events';
import { OrderConfirmedEvent } from '../events/order-confirmed.events';
import { OrderCreatedEvent } from '../events/order-created.events';
import { CustomerId } from '../value-objects/customer-id.vo';
import { OrderItemEntity } from './order-item.entity';
import {
  InvalidOrderStatusError,
  InvalidOrderTransitionError,
  OrderMustHaveItemsError,
  OrderNotFoundError,
  OrderStatusEmptyError,
} from '../errors/order.erros';

export type OrderDomainEvent = OrderCreatedEvent | OrderConfirmedEvent | OrderCancelledEvent;

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  WAITING_DELIVERY = 'WAITING_DELIVERY',
  IN_DELIVERY = 'IN_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

type OrderProps = {
  id: string;
  status: OrderStatus;
  customerId: CustomerId;
  establishmentId: string;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type OrderCreateInput = {
  id: string;
  customerId: CustomerId;
  establishmentId: string;
  items: OrderItemEntity[];
};

type OrderRestoreInput = {
  id: string;
  status: OrderStatus;
  customerId: CustomerId;
  establishmentId: string;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
};

export class OrderEntity {
  private readonly domainEvents: OrderDomainEvent[] = [];

  private constructor(private readonly orderProps: OrderProps) {
    OrderEntity.validate(orderProps);
  }

  get id(): string {
    return this.orderProps.id;
  }

  get status(): OrderStatus {
    return this.orderProps.status;
  }

  get customerId(): CustomerId {
    return this.orderProps.customerId;
  }

  get customerIdString(): string {
    return this.orderProps.customerId.toString();
  }

  get items(): readonly OrderItemEntity[] {
    return [...this.orderProps.items];
  }

  get establishmentId(): string {
    return this.orderProps.establishmentId;
  }

  get createdAt(): Date {
    return this.orderProps.createdAt;
  }

  get updatedAt(): Date {
    return this.orderProps.updatedAt;
  }

  static create(input: OrderCreateInput): OrderEntity {
    const now = new Date();

    const order = new OrderEntity({
      id: input.id,
      status: OrderStatus.CREATED,
      customerId: input.customerId,
      establishmentId: input.establishmentId,
      items: [...input.items],
      createdAt: now,
      updatedAt: now,
    });

    order.recordDomainEvent({
      type: 'order.created',
      occurredAt: now,
      payload: {
        orderId: order.id,
        customerId: order.customerIdString,
        establishmentId: order.establishmentId,
        totalAmountCents: order.totalAmountCents.toString(),
      },
    });

    return order;
  }

  confirm(): void {
    if (this.status !== OrderStatus.CREATED) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.CONFIRMED);
    }

    this.orderProps.status = OrderStatus.CONFIRMED;
    this.orderProps.updatedAt = new Date();

    this.recordDomainEvent({
      type: 'order.confirmed',
      occurredAt: new Date(),
      payload: {
        orderId: this.id,
        customerId: this.customerIdString,
        establishmentId: this.establishmentId,
        totalAmountCents: this.totalAmountCents.toString(),
      },
    });
  }

  cancel(): void {
    if (this.status !== OrderStatus.CREATED && this.status !== OrderStatus.CONFIRMED) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.CANCELED);
    }

    this.orderProps.status = OrderStatus.CANCELED;
    this.orderProps.updatedAt = new Date();

    this.recordDomainEvent({
      type: 'order.cancelled',
      occurredAt: new Date(),
      payload: {
        orderId: this.id,
        customerId: this.customerIdString,
        establishmentId: this.establishmentId,
        totalAmountCents: this.totalAmountCents.toString(),
      },
    });
  }

  addItem(item: OrderItemEntity): void {
    this.ensureItemBelongsToOrder(item);
    this.orderProps.items.push(item);
    this.orderProps.updatedAt = new Date();
  }

  updateItem(
    itemId: string,
    input: { name?: string; quantity?: OrderItemEntity['quantity']; price?: OrderItemEntity['price'] },
  ): void {
    const index = this.orderProps.items.findIndex((item) => item.id === itemId);

    if (index === -1) {
      throw new OrderItemDoesNotBelongToOrderError(itemId, this.id);
    }

    this.orderProps.items[index] = this.orderProps.items[index].update(input);
    this.orderProps.updatedAt = new Date();
  }

  static restore(input: OrderRestoreInput): OrderEntity {
    return new OrderEntity({
      id: input.id,
      status: input.status,
      customerId: input.customerId,
      establishmentId: input.establishmentId,
      items: [...input.items],
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  private static validate(props: OrderProps) {
    if (!props.id.trim()) throw new OrderNotFoundError();
    if (!props.status.trim()) throw new OrderStatusEmptyError();
    if (!Object.values(OrderStatus).includes(props.status)) {
      throw new InvalidOrderStatusError(props.status);
    }
    if (props.items.length === 0) {
      throw new OrderMustHaveItemsError();
    }
    for (const item of props.items) {
      if (item.orderId !== props.id) {
        throw new OrderItemDoesNotBelongToOrderError(item.id, props.id);
      }
    }
  }

  private ensureItemBelongsToOrder(item: OrderItemEntity): void {
    if (item.orderId !== this.id) {
      throw new OrderItemDoesNotBelongToOrderError(item.id, this.id);
    }
  }

  private get totalAmountCents(): bigint {
    return this.orderProps.items.reduce(
      (total, item) => total + item.priceCents * item.quantity.quantity,
      0n,
    );
  }

  private recordDomainEvent(event: OrderDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): OrderDomainEvent[] {
    return this.domainEvents.splice(0, this.domainEvents.length);
  }
}
