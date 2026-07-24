import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { ProductCategoryController } from '@/presentation/controllers/product-category.controller';

function requestFor(userId: string): AuthenticatedRequest {
  return { user: { userId, username: 'joao', email: 'joao@example.com', roles: [] } };
}

const categoryFixture = {
  id: 'category-1',
  name: 'Burgers',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('ProductCategoryController', () => {
  let findAllProductCategoriesUseCase: { execute: ReturnType<typeof mock> };
  let findProductCategoryByIdUseCase: { execute: ReturnType<typeof mock> };
  let createProductCategoryUseCase: { execute: ReturnType<typeof mock> };
  let updateProductCategoryUseCase: { execute: ReturnType<typeof mock> };
  let controller: ProductCategoryController;

  beforeEach(() => {
    findAllProductCategoriesUseCase = { execute: mock() };
    findProductCategoryByIdUseCase = { execute: mock() };
    createProductCategoryUseCase = { execute: mock() };
    updateProductCategoryUseCase = { execute: mock() };

    controller = new ProductCategoryController(
      findAllProductCategoriesUseCase as never,
      findProductCategoryByIdUseCase as never,
      createProductCategoryUseCase as never,
      updateProductCategoryUseCase as never,
    );
  });

  it('findAllProductCategories passes the query filter and the requester id from the token', async () => {
    const expected = {
      list: [categoryFixture],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    };
    findAllProductCategoriesUseCase.execute.mockResolvedValue(expected);

    const filter = { establishmentId: 'establishment-1', limit: 10, offset: 0 };
    const result = await controller.findAllProductCategories(
      filter as never,
      requestFor('owner-1'),
    );

    expect(findAllProductCategoriesUseCase.execute).toHaveBeenCalledWith({
      ...filter,
      requesterId: 'owner-1',
    });
    expect(result).toBe(expected);
  });

  it('findProductCategoryById passes the id and the requester id from the token', async () => {
    findProductCategoryByIdUseCase.execute.mockResolvedValue(categoryFixture);

    const result = await controller.findProductCategoryById('category-1', requestFor('owner-1'));

    expect(findProductCategoryByIdUseCase.execute).toHaveBeenCalledWith({
      id: 'category-1',
      requesterId: 'owner-1',
    });
    expect(result).toBe(categoryFixture);
  });

  it('createProductCategory passes the body and the requester id from the token', async () => {
    createProductCategoryUseCase.execute.mockResolvedValue(categoryFixture);

    const body = { name: 'Burgers', establishmentId: 'establishment-1' };

    const result = await controller.createProductCategory(body as never, requestFor('owner-1'));

    expect(createProductCategoryUseCase.execute).toHaveBeenCalledWith({
      ...body,
      requesterId: 'owner-1',
    });
    expect(result).toBe(categoryFixture);
  });

  it('updateProductCategory passes id, requesterId from the token, and the body', async () => {
    updateProductCategoryUseCase.execute.mockResolvedValue(categoryFixture);

    const body = { name: 'Drinks' };

    const result = await controller.updateProductCategory(
      'category-1',
      body as never,
      requestFor('owner-1'),
    );

    expect(updateProductCategoryUseCase.execute).toHaveBeenCalledWith({
      id: 'category-1',
      requesterId: 'owner-1',
      ...body,
    });
    expect(result).toBe(categoryFixture);
  });
});
