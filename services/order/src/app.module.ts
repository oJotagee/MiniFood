import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { FindOrderItemByIdUseCase } from './application/use-cases/order-item/find-order-item-by-id.use-case';
import { FindAllOrderItemsUseCase } from './application/use-cases/order-item/find-all-order-items.use-case';
import { CreateOrderItemUseCase } from './application/use-cases/order-item/create-order-item.use-case';
import { UpdateOrderItemUseCase } from './application/use-cases/order-item/update-order-item.use-case';
import { OrderItemPrismaRepository } from './infrastructure/repository/order-item-prisma.repository';
import { FindOrderByIdUseCase } from './application/use-cases/order/find-order-by-id.use-case';
import { FindAllOrdersUseCase } from './application/use-cases/order/find-all-orders.use-case';
import { OrderPrismaRepository } from './infrastructure/repository/order-prisma.repository';
import { CreateOrderUseCase } from './application/use-cases/order/create-order.use-case';
import { OrderItemController } from './presentation/controllers/order-item.controller';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { ORDER_ITEM_REPOSITORY } from './application/ports/order-item-repository';
import { HealthController } from './presentation/controllers/health.controller';
import { OrderController } from './presentation/controllers/order.controller';
import { ORDER_REPOSITORY } from './application/ports/order.repository';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [HealthController, OrderController, OrderItemController],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // ORDER_USE_CASES
    FindAllOrdersUseCase,
    FindOrderByIdUseCase,
    CreateOrderUseCase,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderPrismaRepository,
    },
    // ORDER_ITEM_USE_CASES
    FindAllOrderItemsUseCase,
    FindOrderItemByIdUseCase,
    CreateOrderItemUseCase,
    UpdateOrderItemUseCase,
    {
      provide: ORDER_ITEM_REPOSITORY,
      useClass: OrderItemPrismaRepository,
    },
  ],
})
export class AppModule { }
