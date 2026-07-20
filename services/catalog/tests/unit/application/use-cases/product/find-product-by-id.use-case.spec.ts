import { beforeEach, describe, expect, it } from 'bun:test';

import { FindProductByIdUseCase } from '@/application/use-cases/product/find-product-by-id.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { Money } from '@/domain/value-objects/money.vo';

describe('FindProductByIdUseCase', () => {
  let products: InMemoryProductRepository;
  let createProductUseCase: CreateProductUseCase;
  let findByIdUseCase: FindProductByIdUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    createProductUseCase = new CreateProductUseCase(products);
    findByIdUseCase = new FindProductByIdUseCase(products);
  });

  it('returns the product when it exists', async () => {
    const created = await createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: 'category-1',
      requesterId: 'owner-1',
    });

    const found = await findByIdUseCase.execute({ id: created.id });

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Cheeseburger');
  });

  it('throws when the product does not exist', async () => {
    await expect(findByIdUseCase.execute({ id: 'missing-id' })).rejects.toThrow(
      ProductNotFoundError,
    );
  });
});
