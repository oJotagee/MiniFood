import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { ProductController } from '@/presentation/controllers/product.controller';

function requestFor(userId: string): AuthenticatedRequest {
  return { user: { userId, username: 'joao', email: 'joao@example.com', roles: [] } };
}

const productFixture = {
  id: 'product-1',
  name: 'Cheeseburger',
  description: undefined,
  priceCents: 2590n,
  isAvailable: true,
  categoryId: 'category-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('ProductController', () => {
  let findAllProductsUseCase: { execute: ReturnType<typeof mock> };
  let findProductByIdUseCase: { execute: ReturnType<typeof mock> };
  let createProductUseCase: { execute: ReturnType<typeof mock> };
  let updateProductUseCase: { execute: ReturnType<typeof mock> };
  let deactivateProductUseCase: { execute: ReturnType<typeof mock> };
  let activateProductUseCase: { execute: ReturnType<typeof mock> };
  let controller: ProductController;

  beforeEach(() => {
    findAllProductsUseCase = { execute: mock() };
    findProductByIdUseCase = { execute: mock() };
    createProductUseCase = { execute: mock() };
    updateProductUseCase = { execute: mock() };
    deactivateProductUseCase = { execute: mock() };
    activateProductUseCase = { execute: mock() };

    controller = new ProductController(
      findAllProductsUseCase as never,
      findProductByIdUseCase as never,
      createProductUseCase as never,
      updateProductUseCase as never,
      deactivateProductUseCase as never,
      activateProductUseCase as never,
    );
  });

  it('findAllProducts passes the query filter and serializes priceCents to string', async () => {
    findAllProductsUseCase.execute.mockResolvedValue({
      list: [productFixture],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    });

    const result = await controller.findAllProducts({ limit: 10, offset: 0 } as never);

    expect(findAllProductsUseCase.execute).toHaveBeenCalledWith({ limit: 10, offset: 0 });
    expect(result.list[0].priceCents).toBe('2590');
  });

  it('findProductById passes the id and the requester id from the token', async () => {
    findProductByIdUseCase.execute.mockResolvedValue(productFixture);

    const result = await controller.findProductById('product-1', requestFor('owner-1'));

    expect(findProductByIdUseCase.execute).toHaveBeenCalledWith({
      id: 'product-1',
      requesterId: 'owner-1',
    });
    expect(result.priceCents).toBe('2590');
  });

  it('createProduct converts priceCents to Money and uses the requester id from the token', async () => {
    createProductUseCase.execute.mockResolvedValue(productFixture);

    const body = { name: 'Cheeseburger', priceCents: 2590n, categoryId: 'category-1' };

    const result = await controller.createProduct(body as never, requestFor('owner-1'));

    expect(createProductUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Cheeseburger',
        categoryId: 'category-1',
        requesterId: 'owner-1',
      }),
    );
    const call = createProductUseCase.execute.mock.calls[0][0];
    expect(call.priceCents.toCents()).toBe(2590n);
    expect(result.priceCents).toBe('2590');
  });

  it('updateProduct passes id, requesterId from the token, and the body', async () => {
    updateProductUseCase.execute.mockResolvedValue(productFixture);

    const body = { name: 'Bacon Burger' };

    const result = await controller.updateProduct(
      'product-1',
      body as never,
      requestFor('owner-1'),
    );

    expect(updateProductUseCase.execute).toHaveBeenCalledWith({
      id: 'product-1',
      requesterId: 'owner-1',
      ...body,
    });
    expect(result.priceCents).toBe('2590');
  });

  it('deactivateProduct passes the id and the requester id from the token', async () => {
    deactivateProductUseCase.execute.mockResolvedValue(undefined);

    await controller.deactivateProduct('product-1', requestFor('owner-1'));

    expect(deactivateProductUseCase.execute).toHaveBeenCalledWith({
      id: 'product-1',
      requesterId: 'owner-1',
    });
  });

  it('activateProduct passes the id and the requester id from the token', async () => {
    activateProductUseCase.execute.mockResolvedValue(undefined);

    await controller.activateProduct('product-1', requestFor('owner-1'));

    expect(activateProductUseCase.execute).toHaveBeenCalledWith({
      id: 'product-1',
      requesterId: 'owner-1',
    });
  });
});
