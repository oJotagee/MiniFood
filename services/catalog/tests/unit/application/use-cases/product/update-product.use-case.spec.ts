import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateProductUseCase } from '@/application/use-cases/product/update-product.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { Money } from '@/domain/value-objects/money.vo';

describe('UpdateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let createProductUseCase: CreateProductUseCase;
  let updateUseCase: UpdateProductUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    createProductUseCase = new CreateProductUseCase(products);
    updateUseCase = new UpdateProductUseCase(products);
  });

  it('updates product fields', async () => {
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: 'category-1',
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
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: 'category-1',
      requesterId: 'owner-1',
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
    });

    expect(updated.name).toBe('Cheeseburger');
    expect(updated.priceCents).toBe(2590n);
    expect(updated.categoryId).toBe('category-1');
  });

  it('throws when the product does not exist', async () => {
    await expect(
      updateUseCase.execute({ id: 'missing-id', requesterId: 'owner-1', name: 'Combo' }),
    ).rejects.toThrow(ProductNotFoundError);
  });
});
