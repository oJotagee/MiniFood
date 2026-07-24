import { beforeEach, describe, expect, it } from 'bun:test';

import { FindProductByIdUseCase } from '@/application/use-cases/product/find-product-by-id.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductRepository } from '@tests/unit/support/in-memory-product.repository';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
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

describe('FindProductByIdUseCase', () => {
  let products: InMemoryProductRepository;
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;
  let createProductUseCase: CreateProductUseCase;
  let findByIdUseCase: FindProductByIdUseCase;

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
    findByIdUseCase = new FindProductByIdUseCase(products, productCategories, establishments);
  });

  async function createProduct(ownerId: string) {
    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId,
      address,
    });
    const category = await createProductCategoryUseCase.execute({
      name: 'Burgers',
      establishmentId: establishment.id,
      requesterId: ownerId,
    });

    return createProductUseCase.execute({
      name: 'Cheeseburger',
      description: undefined,
      priceCents: Money.fromCents('2590'),
      categoryId: category.id,
      requesterId: ownerId,
    });
  }

  it('returns the product when it exists', async () => {
    const created = await createProduct('owner-1');

    const found = await findByIdUseCase.execute({ id: created.id, requesterId: 'owner-1' });

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Cheeseburger');
  });

  it('throws when the product does not exist', async () => {
    await expect(
      findByIdUseCase.execute({ id: 'missing-id', requesterId: 'owner-1' }),
    ).rejects.toThrow(ProductNotFoundError);
  });

  it('throws when the requester is not the establishment owner', async () => {
    const created = await createProduct('owner-1');

    await expect(
      findByIdUseCase.execute({ id: created.id, requesterId: 'someone-else' }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
