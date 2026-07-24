import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateProductUseCase } from '@/application/use-cases/product/update-product.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
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

describe('UpdateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;
  let createProductUseCase: CreateProductUseCase;
  let updateUseCase: UpdateProductUseCase;

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
    updateUseCase = new UpdateProductUseCase(products, productCategories, establishments);
  });

  async function createCategory(ownerId: string, name = 'Burgers') {
    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId,
      address,
    });

    return createProductCategoryUseCase.execute({
      name,
      establishmentId: establishment.id,
      requesterId: ownerId,
    });
  }

  it('updates product fields', async () => {
    const category = await createCategory('owner-1');
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
      name: 'Bacon Burger',
      priceCents: Money.fromCents('2990'),
    });

    expect(updated.name).toBe('Bacon Burger');
    expect(updated.priceCents).toBe(2990n);
  });

  it('keeps current fields when they are not provided', async () => {
    const category = await createCategory('owner-1');
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
    });

    expect(updated.name).toBe('Cheeseburger');
    expect(updated.priceCents).toBe(2590n);
    expect(updated.categoryId).toBe(category.id);
  });

  it('throws when the product does not exist', async () => {
    await expect(
      updateUseCase.execute({ id: 'missing-id', requesterId: 'owner-1', name: 'Combo' }),
    ).rejects.toThrow(ProductNotFoundError);
  });

  it('throws when the requester does not own the establishment of the current category', async () => {
    const category = await createCategory('owner-1');
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });

    await expect(
      updateUseCase.execute({
        id: created.id,
        requesterId: 'someone-else',
        name: 'Bacon Burger',
      }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });

  it('throws when moving to a category that does not exist', async () => {
    const category = await createCategory('owner-1');
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });

    await expect(
      updateUseCase.execute({
        id: created.id,
        requesterId: 'owner-1',
        categoryId: 'missing-category',
      }),
    ).rejects.toThrow(ProductCategoryNotFoundError);
  });

  it('throws when moving to a category owned by another establishment', async () => {
    const category = await createCategory('owner-1');
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: 'owner-1',
    });
    const otherCategory = await createCategory('owner-2', 'Drinks');

    await expect(
      updateUseCase.execute({
        id: created.id,
        requesterId: 'owner-1',
        categoryId: otherCategory.id,
      }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
