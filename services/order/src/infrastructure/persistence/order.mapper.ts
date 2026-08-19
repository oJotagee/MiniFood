import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import { OrderEntity, OrderStatus } from '@/domain/entities/order.entity';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

type OrderPersistence = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  establishmentId: string;
  customerId: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: bigint;
    createdAt: Date;
    updatedAt: Date;
    itemId: string;
    orderId: string;
  }[];
};

export class OrderMapper {
  static toDomain(raw: OrderPersistence): OrderEntity {
    return OrderEntity.restore({
      id: raw.id,
      status: raw.status as OrderStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      establishmentId: EstablishmentId.fromString(raw.establishmentId),
      customerId: CustomerId.fromString(raw.customerId),
      items: raw.items.map((item) =>
        OrderItemEntity.restore({
          id: item.id,
          name: item.name,
          quantity: Quantity.from(item.quantity),
          price: Money.fromCents(item.price),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          itemId: item.itemId,
          orderId: item.orderId,
        }),
      ),
    });
  }

  static toDomainList(rawList: OrderPersistence[]): OrderEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(order: OrderEntity) {
    return {
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        establishmentId: order.establishmentIdString,
        customerId: order.customerIdString,
      },
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity.quantity,
        price: item.priceCents,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        itemId: item.itemId,
        orderId: item.orderId,
      })),
    };
  }
}
