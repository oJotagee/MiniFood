import { beforeEach, describe, expect, it } from 'bun:test';

import { FindAllProductCategoriesUseCase } from '@/application/use-cases/product-category/find-all-product-categories.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('FindAllProductCategoriesUseCase', () => {
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;
  let findAllUseCase: FindAllProductCategoriesUseCase;
  let establishmentId: string;

  beforeEach(async () => {
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    createEstablishmentUseCase = new CreateEstablishmentUseCase(establishments);
    createProductCategoryUseCase = new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    );
    findAllUseCase = new FindAllProductCategoriesUseCase(productCategories);

    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });
    establishmentId = establishment.id;

    for (let i = 0; i < 15; i++) {
      await createProductCategoryUseCase.execute({
        name: `Category ${i}`,
        establishmentId,
        requesterId: 'owner-1',
      });
    }
  });

  it('applies default pagination when none is provided', async () => {
    const result = await findAllUseCase.execute({ establishmentId });

    expect(result.list).toHaveLength(10);
    expect(result.pagination).toEqual({
      page: 1,
      perPage: 10,
      total: 15,
      totalPages: 2,
    });
  });

  it('filters by name', async () => {
    await createProductCategoryUseCase.execute({
      name: 'Burgers',
      establishmentId,
      requesterId: 'owner-1',
    });

    const result = await findAllUseCase.execute({ establishmentId, name: 'Burgers' });

    expect(result.list).toHaveLength(1);
    expect(result.list[0]?.name).toBe('Burgers');
  });

  it('falls back to the default limit when limit is zero or negative', async () => {
    const zero = await findAllUseCase.execute({ establishmentId, limit: 0 });
    const negative = await findAllUseCase.execute({ establishmentId, limit: -5 });

    expect(zero.pagination.perPage).toBe(10);
    expect(negative.pagination.perPage).toBe(10);
  });

  it('falls back to offset zero when offset is negative', async () => {
    const result = await findAllUseCase.execute({ establishmentId, offset: -20 });

    expect(result.list).toHaveLength(10);
    expect(result.pagination.page).toBe(1);
  });

  it('caps the limit to avoid unbounded page sizes', async () => {
    const result = await findAllUseCase.execute({ establishmentId, limit: 10000 });

    expect(result.pagination.perPage).toBe(100);
  });

  it('ignores non-integer limit and offset values', async () => {
    const result = await findAllUseCase.execute({
      establishmentId,
      limit: 2.5,
      offset: 1.5,
    });

    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.page).toBe(1);
  });
});
