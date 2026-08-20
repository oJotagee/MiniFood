import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { OrderApprovalResolvedEventsHandler } from './application/handlers/order-approval-resolved-events.handler';
import { FindOrderItemByIdUseCase } from './application/use-cases/order-item/find-order-item-by-id.use-case';
import { FindAllOrderItemsUseCase } from './application/use-cases/order-item/find-all-order-items.use-case';
import { ResolveOrderApprovalUseCase } from './application/use-cases/order/resolve-order-approval.use-case';
import { OrderApprovalResolvedConsumer } from './infrastructure/messaging/order-approval-resolved.consumer';
import { UpdateOrderItemUseCase } from './application/use-cases/order-item/update-order-item.use-case';
import { OrderItemPrismaRepository } from './infrastructure/repository/order-item-prisma.repository';
import { FindOrderByIdUseCase } from './application/use-cases/order/find-order-by-id.use-case';
import { FindAllOrdersUseCase } from './application/use-cases/order/find-all-orders.use-case';
import { OrderPrismaRepository } from './infrastructure/repository/order-prisma.repository';
import { OutboxPrismaRepository } from './infrastructure/repository/outbox-prisma.repository';
import { InboxPrismaRepository } from './infrastructure/repository/inbox-prisma.repository';
import { CreateOrderUseCase } from './application/use-cases/order/create-order.use-case';
import { OrderItemController } from './presentation/controllers/order-item.controller';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { ORDER_ITEM_REPOSITORY } from './application/ports/order-item-repository';
import { OUTBOX_REPOSITORY } from './application/ports/outbox-repository.port';
import { INBOX_REPOSITORY } from './application/ports/inbox-repository.port';
import { OutboxRelay } from './infrastructure/messaging/outbox-relay';
import { RabbitMqEventBus } from './infrastructure/messaging/rabbitmq-event-bus';
import { HealthController } from './presentation/controllers/health.controller';
import { OrderController } from './presentation/controllers/order.controller';
import { ORDER_REPOSITORY } from './application/ports/order.repository';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { EVENT_BUS } from './application/ports/event-bus.port';

@Module({
  imports: [],
  controllers: [HealthController, OrderController, OrderItemController],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: EVENT_BUS,
      useClass: RabbitMqEventBus,
    },
    {
      provide: OUTBOX_REPOSITORY,
      useClass: OutboxPrismaRepository,
    },
    {
      provide: INBOX_REPOSITORY,
      useClass: InboxPrismaRepository,
    },
    // OUTBOX (mensageria: publica de forma transacional o que os
    // use cases gravam via OrderEntity.pullDomainEvents())
    OutboxRelay,
    // ORDER_APPROVAL_RESOLVED (mensageria: consome order.approved / order.rejected)
    OrderApprovalResolvedConsumer,
    OrderApprovalResolvedEventsHandler,
    ResolveOrderApprovalUseCase,
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
    UpdateOrderItemUseCase,
    {
      provide: ORDER_ITEM_REPOSITORY,
      useClass: OrderItemPrismaRepository,
    },
  ],
})
export class AppModule {}
