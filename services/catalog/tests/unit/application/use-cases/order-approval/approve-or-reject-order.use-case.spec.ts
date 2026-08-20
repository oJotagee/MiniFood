import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { ApproveOrRejectOrderUseCase } from '@/application/use-cases/order-approval/approve-or-reject-order.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryOrderApprovalRepository } from '@tests/unit/support/in-memory-order-approval.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import {
  ProductBelongsToAnotherEstablishmentError,
  ProductNotAvailableError,
  ProductNotFoundError,
} from '@/domain/errors/product.errors';
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

describe('ApproveOrRejectOrderUseCase', () => {
  let products: InMemoryProductRepository;
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let orderApprovals: InMemoryOrderApprovalRepository;
  let useCase: ApproveOrRejectOrderUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    orderApprovals = new InMemoryOrderApprovalRepository();
    useCase = new ApproveOrRejectOrderUseCase(products, productCategories, orderApprovals);
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

  it('registers a PENDING order approval when all items pass validation (does not auto-approve)', async () => {
    const { establishmentId, productId } = await createAvailableProduct();

    await useCase.execute({
      orderId: 'order-1',
      operationId: 'order:order-1:approval',
      establishmentId,
      items: [{ itemId: productId, quantity: 2, priceCents: '1500' }],
    });

    const approval = await orderApprovals.findByOrderId('order-1');
    expect(approval).not.toBeNull();
    expect(approval?.status).toBe(OrderApprovalStatus.PENDING);
  });

  it('throws ProductNotFoundError and does not register an approval when the product does not exist', async () => {
    const { establishmentId } = await createAvailableProduct();

    await expect(
      useCase.execute({
        orderId: 'order-2',
        operationId: 'order:order-2:approval',
        establishmentId,
        items: [{ itemId: 'missing-product', quantity: 1, priceCents: '1000' }],
      }),
    ).rejects.toThrow(ProductNotFoundError);

    expect(await orderApprovals.findByOrderId('order-2')).toBeNull();
  });

  it('throws ProductNotAvailableError when the product is deactivated', async () => {
    const { establishmentId, productId } = await createAvailableProduct();
    await products.desactivate(productId);

    await expect(
      useCase.execute({
        orderId: 'order-3',
        operationId: 'order:order-3:approval',
        establishmentId,
        items: [{ itemId: productId, quantity: 1, priceCents: '1500' }],
      }),
    ).rejects.toThrow(ProductNotAvailableError);
  });

  it('throws ProductBelongsToAnotherEstablishmentError when the product belongs to a different establishment', async () => {
    const { productId } = await createAvailableProduct('owner-1');
    const other = await createAvailableProduct('owner-2');

    await expect(
      useCase.execute({
        orderId: 'order-4',
        operationId: 'order:order-4:approval',
        establishmentId: other.establishmentId,
        items: [{ itemId: productId, quantity: 1, priceCents: '1500' }],
      }),
    ).rejects.toThrow(ProductBelongsToAnotherEstablishmentError);
  });
});
