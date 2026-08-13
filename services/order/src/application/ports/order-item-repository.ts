import { OrderItemEntity } from '@/domain/entities/order-item.entity';

export const ORDER_ITEM_REPOSITORY = Symbol('ORDER_ITEM_REPOSITORY');

export interface OrderItemRepository {
  findById(id: string): Promise<OrderItemEntity | null>;
  findAll(params: { orderId: string; limit: number; offset: number }): Promise<{
    data: OrderItemEntity[];
    total: number;
  }>;
  save(orderItem: OrderItemEntity): Promise<void>;
  update(orderItem: OrderItemEntity): Promise<void>;
}
