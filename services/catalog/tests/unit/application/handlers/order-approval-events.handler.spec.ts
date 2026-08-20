import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { ApproveOrRejectOrderUseCase } from '@/application/use-cases/order-approval/approve-or-reject-order.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryOrderApprovalRepository } from '@tests/unit/support/in-memory-order-approval.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { OrderApprovalEventsHandler } from '@/application/handlers/order-approval-events.handler';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { FakeOutboxRepository } from '@tests/unit/support/fake-outbox.repository';
import { OrderApprovalStatus } from '@/domain/entities/order-approval.entity';
import { Money } from '@/domain/value-objects/money.vo';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('OrderApprovalEventsHandler', () => {
  let products: InMemoryProductRepository;
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let orderApprovals: InMemoryOrderApprovalRepository;
  let outbox: FakeOutboxRepository;
  let handler: OrderApprovalEventsHandler;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    orderApprovals = new InMemoryOrderApprovalRepository();
    outbox = new FakeOutboxRepository();

    const approveOrRejectOrder = new ApproveOrRejectOrderUseCase(
      products,
      productCategories,
      orderApprovals,
    );
    handler = new OrderApprovalEventsHandler(approveOrRejectOrder, outbox);
  });

  async function createAvailableProduct(ownerId = 'owner-1') {
    const establishment = await new CreateEstablishmentUseCase(establishments).execute({
      name: 'Mini Food',
      ownerId,
      address,
    });
    const category = await new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    ).execute({
      name: 'Burgers',
      establishmentId: establishment.id,
      requesterId: ownerId,
    });
    const product = await new CreateProductUseCase(
      products,
      productCategories,
      establishments,
    ).execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('1500'),
      categoryId: category.id,
      requesterId: ownerId,
    });

    return { establishmentId: establishment.id, productId: product.id };
  }

  it('does NOT publish anything when validation passes — only registers PENDING (no auto-approval)', async () => {
    const { establishmentId, productId } = await createAvailableProduct();

    await handler.handle({
      type: 'order.approval.requested',
      payload: {
        operationId: 'order:order-1:approval',
        orderId: 'order-1',
        establishmentId,
        items: [{ itemId: productId, quantity: 1, priceCents: '1500' }],
      },
    });

    expect(outbox.events).toHaveLength(0);

    const approval = await orderApprovals.findByOrderId('order-1');
    expect(approval?.status).toBe(OrderApprovalStatus.PENDING);
  });

  it('publishes order.rejected automatically when the product does not exist', async () => {
    const { establishmentId } = await createAvailableProduct();

    await handler.handle({
      type: 'order.approval.requested',
      payload: {
        operationId: 'order:order-2:approval',
        orderId: 'order-2',
        establishmentId,
        items: [{ itemId: 'missing-product', quantity: 1, priceCents: '1000' }],
      },
    });

    expect(outbox.events).toHaveLength(1);
    expect(outbox.events[0].type).toBe('order.rejected');
    expect(outbox.events[0].payload).toMatchObject({
      operationId: 'order:order-2:approval',
      orderId: 'order-2',
      reason: 'PRODUCT_NOT_FOUND',
    });

    expect(await orderApprovals.findByOrderId('order-2')).toBeNull();
  });

  it('publishes order.rejected with PRODUCT_NOT_AVAILABLE when the product is deactivated', async () => {
    const { establishmentId, productId } = await createAvailableProduct();
    await products.desactivate(productId);

    await handler.handle({
      type: 'order.approval.requested',
      payload: {
        operationId: 'order:order-3:approval',
        orderId: 'order-3',
        establishmentId,
        items: [{ itemId: productId, quantity: 1, priceCents: '1500' }],
      },
    });

    expect(outbox.events[0].payload).toMatchObject({ reason: 'PRODUCT_NOT_AVAILABLE' });
  });
});
