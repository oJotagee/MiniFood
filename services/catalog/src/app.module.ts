import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { FindAllProductCategoriesUseCase } from './application/use-cases/product-category/find-all-product-categories.use-case';
import { FindProductCategoryByIdUseCase } from './application/use-cases/product-category/find-product-category-by-id.use-case';
import { UpdateProductCategoryUseCase } from './application/use-cases/product-category/update-product-category.use-case';
import { CreateProductCategoryUseCase } from './application/use-cases/product-category/create-product-category.use-case';
import { FindOrderApprovalByIdUseCase } from './application/use-cases/order-approval/find-order-approval-by-id.use-case';
import { FindAllOrderApprovalsUseCase } from './application/use-cases/order-approval/find-all-order-approvals.use-case';
import { FindEstablishmentByIdUseCase } from './application/use-cases/establishment/find-establishment-by-id.use-case';
import { FindAllEstablishmentsUseCase } from './application/use-cases/establishment/find-all-establishments.use-case';
import { ApproveOrRejectOrderUseCase } from './application/use-cases/order-approval/approve-or-reject-order.use-case';
import { ApproveOrderApprovalUseCase } from './application/use-cases/order-approval/approve-order-approval.use-case';
import { RejectOrderApprovalUseCase } from './application/use-cases/order-approval/reject-order-approval.use-case';
import { ProductCategoryPrismaRepository } from './infrastructure/repositories/product-category-prisma.repository';
import { CreateEstablishmentUseCase } from './application/use-cases/establishment/create-establishment.use-case';
import { UpdateEstablishmentUseCase } from './application/use-cases/establishment/update-establishment.use-case';
import { OrderApprovalPrismaRepository } from './infrastructure/repositories/order-approval-prisma.repository';
import { EstablishmentPrismaRepository } from './infrastructure/repositories/establishment-prisma.repository';
import { DesactivateProductUseCase } from './application/use-cases/product/desactive-product.use-case';
import { FindProductByIdUseCase } from './application/use-cases/product/find-product-by-id.use-case';
import { FindAllProductsUseCase } from './application/use-cases/product/find-all-product.use-case';
import { ProductCategoryController } from './presentation/controllers/product-category.controller';
import { PRODUCT_CATEGORY_REPOSITORY } from './application/ports/product-category-repository.port';
import { ActivateProductUseCase } from './application/use-cases/product/activate-product.use-case';
import { OrderApprovalEventsHandler } from './application/handlers/order-approval-events.handler';
import { ProductPrismaRepository } from './infrastructure/repositories/product-prisma.repository';
import { OutboxPrismaRepository } from './infrastructure/repositories/outbox-prisma.repository';
import { ORDER_APPROVAL_REPOSITORY } from './application/ports/order-approval-repository.port';
import { OrderApprovalController } from './presentation/controllers/order-approval.controller';
import { CreateProductUseCase } from './application/use-cases/product/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/product/update-product.use-case';
import { InboxPrismaRepository } from './infrastructure/repositories/inbox-prisma.repository';
import { EstablishmentController } from './presentation/controllers/establishment.controller';
import { ESTABLISHMENT_REPOSITORY } from './application/ports/establishment-repository.port';
import { OrderApprovalConsumer } from './infrastructure/messaging/order-approval.consumer';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { ProductController } from './presentation/controllers/product.controller';
import { PRODUCT_REPOSITORY } from './application/ports/product-repository.port';
import { RabbitMqEventBus } from './infrastructure/messaging/rabbitmq-event-bus';
import { HealthController } from './presentation/controllers/health.controller';
import { OUTBOX_REPOSITORY } from './application/ports/outbox-repository.port';
import { INBOX_REPOSITORY } from './application/ports/inbox-repository.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { OutboxRelay } from './infrastructure/messaging/outbox-relay';
import { EVENT_BUS } from './application/ports/event-bus.port';

@Module({
  imports: [],
  controllers: [
    HealthController,
    EstablishmentController,
    ProductCategoryController,
    ProductController,
    OrderApprovalController,
  ],
  providers: [
    PrismaService,
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
    // handlers gravam via OutboxRepository.add/runInTransaction)
    OutboxRelay,
    // ORDER_APPROVAL (mensageria: consome order.approval.requested,
    // valida e registra PENDING; approve/reject manuais são disparados
    // pelo OrderApprovalController)
    OrderApprovalConsumer,
    OrderApprovalEventsHandler,
    ApproveOrRejectOrderUseCase,
    ApproveOrderApprovalUseCase,
    RejectOrderApprovalUseCase,
    FindAllOrderApprovalsUseCase,
    FindOrderApprovalByIdUseCase,
    {
      provide: ORDER_APPROVAL_REPOSITORY,
      useClass: OrderApprovalPrismaRepository,
    },
    // ESTABLISHMENT_USE_CASES
    FindAllEstablishmentsUseCase,
    FindEstablishmentByIdUseCase,
    CreateEstablishmentUseCase,
    UpdateEstablishmentUseCase,
    {
      provide: ESTABLISHMENT_REPOSITORY,
      useClass: EstablishmentPrismaRepository,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // PRODUCT_CATEGORY_USE_CASES
    FindAllProductCategoriesUseCase,
    FindProductCategoryByIdUseCase,
    CreateProductCategoryUseCase,
    UpdateProductCategoryUseCase,
    {
      provide: PRODUCT_CATEGORY_REPOSITORY,
      useClass: ProductCategoryPrismaRepository,
    },
    // PRODUCT_USE_CASES
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DesactivateProductUseCase,
    ActivateProductUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductPrismaRepository,
    },
  ],
})
export class AppModule {}
