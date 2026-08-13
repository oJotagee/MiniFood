import { OrderEntity } from '@/domain/entities/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findAll(params: { ownerId: string; limit: number; offset: number }): Promise<{
    data: OrderEntity[];
    total: number;
  }>;
  save(order: OrderEntity): Promise<void>;
  update(order: OrderEntity): Promise<void>;
}
