import { Inject, Injectable } from '@nestjs/common';

import { ORDER_ITEM_CREATION_TOKEN, OrderItemEntity } from '@/domain/entities/order-item.entity';
import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { OrderEntity } from '@/domain/entities/order.entity';
import { Money } from '@/domain/value-objects/money.vo';

type CreateOrderItemInput = {
  name: string;
  quantity: number | string;
  priceCents: bigint | string;
  itemId: string;
};

type CreateOrderInput = {
  customerId: string;
  establishmentId: string;
  items: CreateOrderItemInput[];
};

type CreateOrderItemOutput = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  itemId: string;
  orderId: string;
};

type CreateOrderOutput = {
  id: string;
  status: string;
  customerId: string;
  establishmentId: string;
  items: CreateOrderItemOutput[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const orderId = crypto.randomUUID();

    const items = input.items.map((item) =>
      OrderItemEntity.create(
        {
          id: crypto.randomUUID(),
          name: item.name,
          quantity: Quantity.from(item.quantity),
          price: Money.fromCents(item.priceCents),
          itemId: item.itemId,
          orderId,
        },
        ORDER_ITEM_CREATION_TOKEN,
      ),
    );

    const order = OrderEntity.create({
      id: orderId,
      customerId: CustomerId.fromString(input.customerId),
      establishmentId: EstablishmentId.fromString(input.establishmentId),
      items,
    });

    await this.orders.save(order);

    return {
      id: order.id,
      status: order.status,
      customerId: order.customerIdString,
      establishmentId: order.establishmentIdString,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantityString,
        price: item.price.toDecimal(),
        itemId: item.itemId,
        orderId: item.orderId,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
