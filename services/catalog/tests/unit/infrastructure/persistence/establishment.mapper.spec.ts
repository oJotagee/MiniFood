import { describe, expect, it } from 'bun:test';

import { EstablishmentMapper } from '../../../../src/infrastructure/persistence/establishment.mapper';
import { EstablishmentEntity } from '../../../../src/domain/entities/establishment.entity';
import { Address } from '../../../../src/domain/value-objects/address.vo';

const address = Address.create({
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
});

const rawAddress = {
  street: 'Main St',
  number: '100',
  complement: null,
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('EstablishmentMapper', () => {
  describe('toDomain', () => {
    it('restores an establishment entity from persistence data', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');

      const establishment = EstablishmentMapper.toDomain({
        id: 'establishment-1',
        name: 'Mini Food',
        description: 'Best burgers in town',
        ownerId: 'owner-1',
        createdAt,
        updatedAt,
        address: rawAddress,
      });

      expect(establishment).toBeInstanceOf(EstablishmentEntity);
      expect(establishment.id).toBe('establishment-1');
      expect(establishment.name).toBe('Mini Food');
      expect(establishment.description).toBe('Best burgers in town');
      expect(establishment.ownerId).toBe('owner-1');
      expect(establishment.createdAt).toBe(createdAt);
      expect(establishment.updatedAt).toBe(updatedAt);
      expect(establishment.address.toJSON()).toEqual(address.toJSON());
      expect(establishment.pullDomainEvents()).toEqual([]);
    });

    it('treats a null description as no description', () => {
      const establishment = EstablishmentMapper.toDomain({
        id: 'establishment-1',
        name: 'Mini Food',
        description: null,
        ownerId: 'owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: rawAddress,
      });

      expect(establishment.description).toBeUndefined();
    });

    it('treats a null complement as no complement', () => {
      const establishment = EstablishmentMapper.toDomain({
        id: 'establishment-1',
        name: 'Mini Food',
        description: null,
        ownerId: 'owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: { ...rawAddress, complement: null },
      });

      expect(establishment.address.complement).toBeUndefined();
    });

    it('preserves a non-null complement', () => {
      const establishment = EstablishmentMapper.toDomain({
        id: 'establishment-1',
        name: 'Mini Food',
        description: null,
        ownerId: 'owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: { ...rawAddress, complement: 'Suite 4' },
      });

      expect(establishment.address.complement).toBe('Suite 4');
    });

    it('throws when address is missing', () => {
      expect(() =>
        EstablishmentMapper.toDomain({
          id: 'establishment-1',
          name: 'Mini Food',
          description: null,
          ownerId: 'owner-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        }),
      ).toThrow('Establishment address not found');
    });
  });

  describe('toDomainList', () => {
    it('maps a list of raw records to entities', () => {
      const list = EstablishmentMapper.toDomainList([
        {
          id: 'establishment-1',
          name: 'Mini Food',
          description: null,
          ownerId: 'owner-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          address: rawAddress,
        },
        {
          id: 'establishment-2',
          name: 'Mega Food',
          description: null,
          ownerId: 'owner-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          address: rawAddress,
        },
      ]);

      expect(list).toHaveLength(2);
      expect(list[0]?.id).toBe('establishment-1');
      expect(list[1]?.id).toBe('establishment-2');
    });

    it('returns an empty array for an empty list', () => {
      expect(EstablishmentMapper.toDomainList([])).toEqual([]);
    });
  });

  describe('toPersistence', () => {
    it('maps an establishment entity to persistence shape', () => {
      const establishment = EstablishmentEntity.create({
        id: 'establishment-1',
        name: 'Mini Food',
        description: 'Best burgers in town',
        ownerId: 'owner-1',
        address,
      });

      const persistence = EstablishmentMapper.toPersistence(establishment);

      expect(persistence.establishment).toEqual({
        id: 'establishment-1',
        name: 'Mini Food',
        description: 'Best burgers in town',
        ownerId: 'owner-1',
        createdAt: establishment.createdAt,
        updatedAt: establishment.updatedAt,
      });
      expect(persistence.address).toEqual({
        street: 'Main St',
        number: '100',
        complement: null,
        neighborhood: 'Center',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '01000-000',
      });
    });

    it('maps an undefined description to null', () => {
      const establishment = EstablishmentEntity.create({
        id: 'establishment-1',
        name: 'Mini Food',
        ownerId: 'owner-1',
        address,
      });

      const persistence = EstablishmentMapper.toPersistence(establishment);

      expect(persistence.establishment.description).toBeNull();
    });

    it('maps an undefined complement to null', () => {
      const establishment = EstablishmentEntity.create({
        id: 'establishment-1',
        name: 'Mini Food',
        ownerId: 'owner-1',
        address,
      });

      const persistence = EstablishmentMapper.toPersistence(establishment);

      expect(persistence.address.complement).toBeNull();
    });

    it('round-trips through toPersistence and toDomain', () => {
      const establishment = EstablishmentEntity.create({
        id: 'establishment-1',
        name: 'Mini Food',
        description: 'Best burgers in town',
        ownerId: 'owner-1',
        address,
      });

      const persistence = EstablishmentMapper.toPersistence(establishment);
      const restored = EstablishmentMapper.toDomain({
        ...persistence.establishment,
        address: persistence.address,
      });

      expect(restored.id).toBe(establishment.id);
      expect(restored.name).toBe(establishment.name);
      expect(restored.description).toBe(establishment.description);
      expect(restored.ownerId).toBe(establishment.ownerId);
      expect(restored.address.toJSON()).toEqual(establishment.address.toJSON());
    });
  });
});
