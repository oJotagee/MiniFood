import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

type OrderItemPersistence = {
  id: string;
  name: string;
  quantity: number;
  price: bigint;
  createdAt: Date;
  updatedAt: Date;
  itemId: string;
  orderId: string;
};

export class OrderItemMapper {
  static toDomain(raw: OrderItemPersistence): OrderItemEntity {
    return OrderItemEntity.restore({
      id: raw.id,
      name: raw.name,
      quantity: Quantity.from(raw.quantity),
      price: Money.fromCents(raw.price),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      itemId: raw.itemId,
      orderId: raw.orderId,
    });
  }

  static toDomainList(rawList: OrderItemPersistence[]): OrderItemEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(orderItem: OrderItemEntity) {
    return {
      id: orderItem.id,
      name: orderItem.name,
      quantity: orderItem.quantity.quantity,
      price: orderItem.priceCents,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
      itemId: orderItem.itemId,
      orderId: orderItem.orderId,
    };
  }
}
