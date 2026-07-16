import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateProductCategoryUseCase } from '@/application/use-cases/product-category/update-product-category.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryProductCategoryRepository } from '@tests/unit/support/in-memory-product-category.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
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

describe('UpdateProductCategoryUseCase', () => {
  let productCategories: InMemoryProductCategoryRepository;
  let establishments: InMemoryEstablishmentRepository;
  let createEstablishmentUseCase: CreateEstablishmentUseCase;
  let createProductCategoryUseCase: CreateProductCategoryUseCase;
  let updateUseCase: UpdateProductCategoryUseCase;

  beforeEach(() => {
    productCategories = new InMemoryProductCategoryRepository();
    establishments = new InMemoryEstablishmentRepository();
    createEstablishmentUseCase = new CreateEstablishmentUseCase(establishments);
    createProductCategoryUseCase = new CreateProductCategoryUseCase(
      productCategories,
      establishments,
    );
    updateUseCase = new UpdateProductCategoryUseCase(productCategories, establishments);
  });

  it('updates the product category name', async () => {
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

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
      name: 'Combos',
    });

    expect(updated.name).toBe('Combos');
  });

  it('keeps the current name when it is not provided', async () => {
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

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
    });

    expect(updated.name).toBe('Burgers');
  });

  it('throws when the product category does not exist', async () => {
    await expect(
      updateUseCase.execute({ id: 'missing-id', requesterId: 'owner-1', name: 'Combos' }),
    ).rejects.toThrow(ProductCategoryNotFoundError);
  });

  it('throws when the establishment no longer exists', async () => {
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

    establishments = new InMemoryEstablishmentRepository();
    updateUseCase = new UpdateProductCategoryUseCase(productCategories, establishments);

    await expect(
      updateUseCase.execute({ id: created.id, requesterId: 'owner-1', name: 'Combos' }),
    ).rejects.toThrow(EstablishmentNotFoundError);
  });

  it('throws when the requester is not the establishment owner', async () => {
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

    await expect(
      updateUseCase.execute({
        id: created.id,
        requesterId: 'someone-else',
        name: 'Hijacked',
      }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
