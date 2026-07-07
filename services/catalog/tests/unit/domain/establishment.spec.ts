import { describe, expect, it } from 'bun:test';

import { EstablishmentEntity } from '../../../src/domain/establishment/establishment.entity';
import { InvalidEstablishmentDataError } from '../../../src/domain/establishment/establishment.error';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('EstablishmentEntity', () => {
  it('creates an establishment and records a creation event', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      operationId: 'operation-1',
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    expect(establishment.address.toJSON()).toEqual(address);
    expect(establishment.pullDomainEvents()).toEqual([
      {
        type: 'establishment.created',
        occurredAt: establishment.createdAt,
        payload: {
          operationId: 'operation-1',
          establishmentId: 'establishment-1',
          ownerId: 'owner-1',
          name: 'Mini Food',
          description: undefined,
          address,
        },
      },
    ]);
    expect(establishment.pullDomainEvents()).toEqual([]);
  });

  it('updates an establishment and records an update event', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      operationId: 'operation-1',
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });
    establishment.pullDomainEvents();

    const updated = establishment.update({
      operationId: 'operation-2',
      name: 'Mini Food Updated',
    });

    expect(updated.pullDomainEvents()).toEqual([
      {
        type: 'establishment.updated',
        occurredAt: updated.updatedAt,
        payload: {
          operationId: 'operation-2',
          establishmentId: 'establishment-1',
          ownerId: 'owner-1',
          name: 'Mini Food Updated',
          description: undefined,
          address,
        },
      },
    ]);
  });

  it('restores an establishment without recording domain events', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const establishment = EstablishmentEntity.restore({
      id: 'establishment-1',
      name: 'Mini Food',
      ownerId: 'owner-1',
      createdAt,
      updatedAt,
      address,
    });

    expect(establishment.createdAt).toBe(createdAt);
    expect(establishment.updatedAt).toBe(updatedAt);
    expect(establishment.pullDomainEvents()).toEqual([]);
  });

  it('rejects blank establishment name', () => {
    expect(() =>
      EstablishmentEntity.create({
        id: 'establishment-1',
        operationId: 'operation-1',
        name: '',
        ownerId: 'owner-1',
        address,
      }),
    ).toThrow(InvalidEstablishmentDataError);
  });
});
