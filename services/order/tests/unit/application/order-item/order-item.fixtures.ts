import { OrderItemEntity } from '@/domain/entities/order-item.entity';
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
