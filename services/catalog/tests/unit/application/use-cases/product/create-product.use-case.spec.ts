import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { Money } from '@/domain/value-objects/money.vo';

describe('CreateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let createProductUseCase: CreateProductUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    createProductUseCase = new CreateProductUseCase(products);
  });

  it('creates and persists a product', async () => {
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: 'Tasty burger',
      priceCents: Money.fromCents('2590'),
      categoryId: 'category-1',
      requesterId: 'owner-1',
    });

    const persisted = await products.findById(created.id);

    expect(persisted).not.toBeNull();
    expect(persisted?.name).toBe('Cheeseburger');
    expect(persisted?.priceCents).toBe(2590n);
    expect(persisted?.categoryId).toBe('category-1');
    expect(persisted?.isAvailable).toBe(true);
  });

  it('returns primitives, not the entity', async () => {
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: 'category-1',
      requesterId: 'owner-1',
    });

    expect(created.priceCents).toBe(2590n);
    expect(created.description).toBeUndefined();
  });
});
