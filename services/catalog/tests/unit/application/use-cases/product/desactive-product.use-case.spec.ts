import { beforeEach, describe, expect, it } from 'bun:test';

import { DesactivateProductUseCase } from '@/application/use-cases/product/desactive-product.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { Money } from '@/domain/value-objects/money.vo';

describe('DesactivateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let createProductUseCase: CreateProductUseCase;
  let desactivateUseCase: DesactivateProductUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    createProductUseCase = new CreateProductUseCase(products);
    desactivateUseCase = new DesactivateProductUseCase(products);
  });

  it('deactivates an existing product', async () => {
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: 'category-1',
      requesterId: 'owner-1',
    });

    const result = await desactivateUseCase.execute({ id: created.id });

    expect(result.isAvailable).toBe(false);

    const persisted = await products.findById(created.id);
    expect(persisted?.isAvailable).toBe(false);
  });

  it('throws when the product does not exist', async () => {
    await expect(desactivateUseCase.execute({ id: 'missing-id' })).rejects.toThrow(
      ProductNotFoundError,
    );
  });
});
