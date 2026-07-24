import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import { EstablishmentNotOwnedError } from '@/domain/errors/establishment.error';
import { Money } from '@/domain/value-objects/money.vo';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('CreateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;
  let createProductUseCase: CreateProductUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    createEstablishmentUseCase = new CreateEstablishmentUseCase(establishments);
    createProductCategoryUseCase = new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    );
    createProductUseCase = new CreateProductUseCase(products, productCategories, establishments);
  });

  async function createCategory(ownerId: string) {
    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId,
      address,
    });

    return createProductCategoryUseCase.execute({
      name: 'Burgers',
      establishmentId: establishment.id,
      requesterId: ownerId,
    });
  }

  it('creates and persists a product', async () => {
    const category = await createCategory('owner-1');

    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: 'Tasty burger',
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });

    const persisted = await products.findById(created.id);

    expect(persisted).not.toBeNull();
    expect(persisted?.name).toBe('Cheeseburger');
    expect(persisted?.priceCents).toBe(2590n);
    expect(persisted?.categoryId).toBe(category.id);
    expect(persisted?.isAvailable).toBe(true);
  });

  it('returns primitives, not the entity', async () => {
    const category = await createCategory('owner-1');

    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });

    expect(created.priceCents).toBe(2590n);
    expect(created.description).toBeUndefined();
  });

  it('throws when the product category does not exist', async () => {
    await expect(
      createProductUseCase.execute({
        name: 'Cheeseburger',
        description: undefined,
        priceCents: Money.fromCents('2590'),
        categoryId: 'missing-category',
        requesterId: 'owner-1',
      }),
    ).rejects.toThrow(ProductCategoryNotFoundError);
  });

  it('throws when the requester is not the establishment owner', async () => {
    const category = await createCategory('owner-1');

    await expect(
      createProductUseCase.execute({
        name: 'Cheeseburger',
        description: undefined,
        priceCents: Money.fromCents('2590'),
        categoryId: category.id,
        requesterId: 'someone-else',
      }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
