import { describe, expect, it } from 'bun:test';

import { InvalidEstablishmentDataError } from '@/domain/errors/establishment.error';
import { EstablishmentEntity } from '@/domain/entities/establishment.entity';
import { Address } from '@/domain/value-objects/address.vo';

const address = Address.create({
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
});

describe('EstablishmentEntity', () => {
  it('creates an establishment and records a creation event', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    expect(establishment.address.toJSON()).toEqual(address.toJSON());
    expect(establishment.pullDomainEvents()).toEqual([
      {
        type: 'establishment.created',
        occurredAt: establishment.createdAt,
        payload: {
          establishmentId: 'establishment-1',
          ownerId: 'owner-1',
          name: 'Mini Food',
          description: undefined,
          address: address.toJSON(),
        },
      },
    ]);
    expect(establishment.pullDomainEvents()).toEqual([]);
  });

  it('updates an establishment and records an update event', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });
    establishment.pullDomainEvents();

    const updated = establishment.update({ name: 'Mini Food Updated' });

    expect(updated.pullDomainEvents()).toEqual([
      {
        type: 'establishment.updated',
        occurredAt: updated.updatedAt,
        payload: {
          establishmentId: 'establishment-1',
          ownerId: 'owner-1',
          name: 'Mini Food Updated',
          description: undefined,
          address: address.toJSON(),
        },
      },
    ]);
  });

  it('keeps the current description when no description is provided', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      name: 'Mini Food',
      description: 'Best burgers in town',
      ownerId: 'owner-1',
      address,
    });

    const updated = establishment.update({ name: 'Mini Food Updated' });

    expect(updated.description).toBe('Best burgers in town');
  });

  it('replaces the description when a new one is provided', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      name: 'Mini Food',
      description: 'Best burgers in town',
      ownerId: 'owner-1',
      address,
    });

    const updated = establishment.update({ description: 'Now with fries' });

    expect(updated.description).toBe('Now with fries');
  });

  it('clears the description when explicitly set to null', () => {
    const establishment = EstablishmentEntity.create({
      id: 'establishment-1',
      name: 'Mini Food',
      description: 'Best burgers in town',
      ownerId: 'owner-1',
      address,
    });

    const updated = establishment.update({ description: null });

    expect(updated.description).toBeUndefined();
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
        name: '',
        ownerId: 'owner-1',
        address,
      }),
    ).toThrow(InvalidEstablishmentDataError);
  });

  it('rejects blank owner id', () => {
    expect(() =>
      EstablishmentEntity.create({
        id: 'establishment-1',
        name: 'Mini Food',
        ownerId: '',
        address,
      }),
    ).toThrow(InvalidEstablishmentDataError);
  });
});
