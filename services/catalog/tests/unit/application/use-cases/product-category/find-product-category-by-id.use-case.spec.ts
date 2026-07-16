import { beforeEach, describe, expect, it } from 'bun:test';

import { FindProductCategoryByIdUseCase } from '@/application/use-cases/product-category/find-product-category-by-id.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('FindProductCategoryByIdUseCase', () => {
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;
  let findByIdUseCase: FindProductCategoryByIdUseCase;

  beforeEach(() => {
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    createEstablishmentUseCase = new CreateEstablishmentUseCase(establishments);
    createProductCategoryUseCase = new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    );
    findByIdUseCase = new FindProductCategoryByIdUseCase(productCategories);
  });

  it('returns the product category when it exists', async () => {
    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    const created = await createProductCategoryUseCase.execute({
      name: 'Burgers',
      establishmentId: establishment.id,
      requesterId: 'owner-1',
    });

    const found = await findByIdUseCase.execute({ id: created.id });

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Burgers');
  });

  it('throws when the product category does not exist', async () => {
    await expect(findByIdUseCase.execute({ id: 'missing-id' })).rejects.toThrow(
      ProductCategoryNotFoundError,
    );
  });
});
