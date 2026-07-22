import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { EstablishmentController } from '@/presentation/controllers/establishment.controller';

function requestFor(userId: string): AuthenticatedRequest {
  return { user: { userId, username: 'joao', email: 'joao@example.com', roles: [] } };
}

const establishmentFixture = {
  id: 'est-1',
  name: 'Mini Food',
  description: undefined,
  ownerId: 'owner-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  address: {
    street: 'Main St',
    number: '100',
    neighborhood: 'Center',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '01000-000',
  },
};

describe('EstablishmentController', () => {
  let findAllEstablishmentsUseCase: { execute: ReturnType<typeof mock> };
  let findEstablishmentByIdUseCase: { execute: ReturnType<typeof mock> };
  let createEstablishmentUseCase: { execute: ReturnType<typeof mock> };
  let updateEstablishmentUseCase: { execute: ReturnType<typeof mock> };
  let controller: EstablishmentController;

  beforeEach(() => {
    findAllEstablishmentsUseCase = { execute: mock() };
    findEstablishmentByIdUseCase = { execute: mock() };
    createEstablishmentUseCase = { execute: mock() };
    updateEstablishmentUseCase = { execute: mock() };

    controller = new EstablishmentController(
      findAllEstablishmentsUseCase as never,
      findEstablishmentByIdUseCase as never,
      createEstablishmentUseCase as never,
      updateEstablishmentUseCase as never,
    );
  });

  it('findAllEstablishments passes the requester id from the token and the query filter', async () => {
    const expected = { list: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } };
    findAllEstablishmentsUseCase.execute.mockResolvedValue(expected);

    const result = await controller.findAllEstablishments(
      { limit: 10, offset: 0 },
      requestFor('owner-1'),
    );

    expect(findAllEstablishmentsUseCase.execute).toHaveBeenCalledWith({
      ownerId: 'owner-1',
      limit: 10,
      offset: 0,
    });
    expect(result).toBe(expected);
  });

  it('findEstablishmentById passes the id and the requester id from the token', async () => {
    const expected = establishmentFixture;
    findEstablishmentByIdUseCase.execute.mockResolvedValue(expected);

    const result = await controller.findEstablishmentById('est-1', requestFor('owner-1'));

    expect(findEstablishmentByIdUseCase.execute).toHaveBeenCalledWith({
      id: 'est-1',
      requesterId: 'owner-1',
    });
    expect(result).toBe(expected);
  });

  it('createEstablishment ignores any ownerId in the body and uses the token instead', async () => {
    const expected = establishmentFixture;
    createEstablishmentUseCase.execute.mockResolvedValue(expected);

    const body = {
      name: 'Mini Food',
      address: {
        street: 'Main St',
        number: '100',
        neighborhood: 'Center',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '01000-000',
      },
    };

    const result = await controller.createEstablishment(body as never, requestFor('owner-1'));

    expect(createEstablishmentUseCase.execute).toHaveBeenCalledWith({
      ownerId: 'owner-1',
      ...body,
    });
    expect(result).toBe(expected);
  });

  it('updateEstablishment passes id, requesterId from the token, and the body', async () => {
    const expected = establishmentFixture;
    updateEstablishmentUseCase.execute.mockResolvedValue(expected);

    const body = { name: 'Mini Food 2' };

    const result = await controller.updateEstablishment(
      'est-1',
      body as never,
      requestFor('owner-1'),
    );

    expect(updateEstablishmentUseCase.execute).toHaveBeenCalledWith({
      id: 'est-1',
      requesterId: 'owner-1',
      ...body,
    });
    expect(result).toBe(expected);
  });
});
