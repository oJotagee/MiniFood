import { beforeEach, describe, expect, it } from 'bun:test';

import { FindAllProductsUseCase } from '@/application/use-cases/product/find-all-product.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { Money } from '@/domain/value-objects/money.vo';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('FindAllProductsUseCase', () => {
  let products: InMemoryProductRepository;
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createProductUseCase: CreateProductUseCase;
  let findAllUseCase: FindAllProductsUseCase;
  let categoryId: string;

  beforeEach(async () => {
    products = new InMemoryProductRepository();
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    const createEstablishmentUseCase = new CreateEstablishmentUseCase(establishments);
    const createProductCategoryUseCase = new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    );
    createProductUseCase = new CreateProductUseCase(products, productCategories, establishments);
    findAllUseCase = new FindAllProductsUseCase(products);

    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });
    const category = await createProductCategoryUseCase.execute({
      name: 'Burgers',
      establishmentId: establishment.id,
      requesterId: 'owner-1',
    });
    categoryId = category.id;

    for (let i = 0; i < 15; i++) {
      await createProductUseCase.execute({
        name: `Product ${i}`,
        description: undefined,
        priceCents: Money.fromCents('1000'),
        categoryId,
        requesterId: 'owner-1',
      });
    }
  });

  it('applies default pagination when none is provided', async () => {
    const result = await findAllUseCase.execute({});

    expect(result.list).toHaveLength(10);
    expect(result.pagination).toEqual({
      page: 1,
      perPage: 10,
      total: 15,
      totalPages: 2,
    });
  });

  it('filters by name', async () => {
    await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('1000'),
      categoryId,
      requesterId: 'owner-1',
    });

    const result = await findAllUseCase.execute({ name: 'Cheeseburger' });

    expect(result.list).toHaveLength(1);
    expect(result.list[0]?.name).toBe('Cheeseburger');
  });

  it('falls back to the default limit when limit is zero or negative', async () => {
    const zero = await findAllUseCase.execute({ limit: 0 });
    const negative = await findAllUseCase.execute({ limit: -5 });

    expect(zero.pagination.perPage).toBe(10);
    expect(negative.pagination.perPage).toBe(10);
  });

  it('falls back to offset zero when offset is negative', async () => {
    const result = await findAllUseCase.execute({ offset: -20 });

    expect(result.list).toHaveLength(10);
    expect(result.pagination.page).toBe(1);
  });

  it('caps the limit to avoid unbounded page sizes', async () => {
    const result = await findAllUseCase.execute({ limit: 10000 });

    expect(result.pagination.perPage).toBe(100);
  });

  it('ignores non-integer limit and offset values', async () => {
    const result = await findAllUseCase.execute({ limit: 2.5, offset: 1.5 });

    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.page).toBe(1);
  });
});
