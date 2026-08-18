import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import { OrderEntity, OrderStatus } from '@/domain/entities/order.entity';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

export function buildOrderItem(
  overrides: Partial<{
    id: string;
    name: string;
    quantity: number;
    priceCents: bigint;
    itemId: string;
    orderId: string;
  }> = {},
): OrderItemEntity {
  return OrderItemEntity.restore({
    id: overrides.id ?? 'item-1',
    name: overrides.name ?? 'Hamburger',
    quantity: Quantity.from(overrides.quantity ?? 2),
    price: Money.fromCents(overrides.priceCents ?? 1500n),
    itemId: overrides.itemId ?? 'catalog-item-1',
    orderId: overrides.orderId ?? 'order-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

export function buildOrder(
  overrides: Partial<{
    id: string;
    status: OrderStatus;
    customerId: string;
    establishmentId: string;
    items: OrderItemEntity[];
  }> = {},
): OrderEntity {
  const id = overrides.id ?? 'order-1';

  return OrderEntity.restore({
    id,
    status: overrides.status ?? OrderStatus.CREATED,
    customerId: CustomerId.fromString(overrides.customerId ?? 'customer-1'),
    establishmentId: EstablishmentId.fromString(overrides.establishmentId ?? 'establishment-1'),
    items: overrides.items ?? [buildOrderItem({ orderId: id })],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}
