import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindAllProductsUseCase } from '@/application/use-cases/product/find-all-product.use-case';

describe('FindAllProductsUseCase', () => {
  let productRepository: { findAll: ReturnType<typeof mock> };
  let establishmentRepository: { findIdsByOwnerId: ReturnType<typeof mock> };
  let findAllUseCase: FindAllProductsUseCase;

  beforeEach(async () => {
    productRepository = { findAll: mock() };
    establishmentRepository = { findIdsByOwnerId: mock() };
    establishmentRepository.findIdsByOwnerId.mockResolvedValue(['establishment-1']);
    findAllUseCase = new FindAllProductsUseCase(
      productRepository as never,
      establishmentRepository as never,
    );
  });

  it('resolves the owner establishment ids before querying products', async () => {
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    await findAllUseCase.execute({ requesterId: 'owner-1' });

    expect(establishmentRepository.findIdsByOwnerId).toHaveBeenCalledWith('owner-1');
  });

  it('applies default pagination when none is provided', async () => {
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await findAllUseCase.execute({ requesterId: 'owner-1' });

    expect(productRepository.findAll).toHaveBeenCalledWith({
      name: '',
      establishmentIds: ['establishment-1'],
      limit: 10,
      offset: 0,
    });
    expect(result.pagination).toEqual({
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it('filters by name', async () => {
    productRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 'product-1',
          name: 'Cheeseburger',
          description: undefined,
          priceCents: 1000n,
          isAvailable: true,
          categoryId: 'category-1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ],
      total: 1,
    });

    const result = await findAllUseCase.execute({ name: 'Cheeseburger', requesterId: 'owner-1' });

    expect(productRepository.findAll).toHaveBeenCalledWith({
      name: 'Cheeseburger',
      establishmentIds: ['establishment-1'],
      limit: 10,
      offset: 0,
    });

    expect(result.list).toHaveLength(1);
    expect(result.list[0]?.name).toBe('Cheeseburger');
  });

  it('falls back to the default limit when limit is zero or negative', async () => {
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const zero = await findAllUseCase.execute({ limit: 0, requesterId: 'owner-1' });
    const negative = await findAllUseCase.execute({ limit: -5, requesterId: 'owner-1' });

    expect(zero.pagination.perPage).toBe(10);
    expect(negative.pagination.perPage).toBe(10);
  });

  it('falls back to offset zero when offset is negative', async () => {
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await findAllUseCase.execute({ offset: -20, requesterId: 'owner-1' });

    expect(result.pagination.page).toBe(1);
  });

  it('caps the limit to avoid unbounded page sizes', async () => {
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await findAllUseCase.execute({ limit: 10000, requesterId: 'owner-1' });

    expect(result.pagination.perPage).toBe(100);
  });

  it('ignores non-integer limit and offset values', async () => {
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await findAllUseCase.execute({
      limit: 2.5,
      offset: 1.5,
      requesterId: 'owner-1',
    });

    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.page).toBe(1);
  });

  it('returns no products and skips the query when the owner has no establishments', async () => {
    establishmentRepository.findIdsByOwnerId.mockResolvedValue([]);
    productRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await findAllUseCase.execute({ requesterId: 'owner-without-establishments' });

    expect(productRepository.findAll).toHaveBeenCalledWith({
      name: '',
      establishmentIds: [],
      limit: 10,
      offset: 0,
    });
    expect(result.list).toEqual([]);
  });
});
