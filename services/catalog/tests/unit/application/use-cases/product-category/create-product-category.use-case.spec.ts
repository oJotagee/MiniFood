import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('CreateProductCategoryUseCase', () => {
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;

  beforeEach(() => {
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    createEstablishmentUseCase = new CreateEstablishmentUseCase(establishments);
    createProductCategoryUseCase = new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    );
  });

  it('creates and persists a product category', async () => {
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

    const persisted = await productCategories.findById(created.id);

    expect(persisted).not.toBeNull();
    expect(persisted?.name).toBe('Burgers');
    expect(persisted?.establishmentId).toBe(establishment.id);
  });

  it('throws when the establishment does not exist', async () => {
    await expect(
      createProductCategoryUseCase.execute({
        name: 'Burgers',
        establishmentId: 'missing-id',
        requesterId: 'owner-1',
      }),
    ).rejects.toThrow(EstablishmentNotFoundError);
  });

  it('throws when the requester is not the establishment owner', async () => {
    const establishment = await createEstablishmentUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    await expect(
      createProductCategoryUseCase.execute({
        name: 'Burgers',
        establishmentId: establishment.id,
        requesterId: 'someone-else',
      }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
