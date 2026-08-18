import { InvalidEstablishmentIdError } from '../errors/establishment-id.errors';

export class EstablishmentId {
  private constructor(readonly value: string) {
    if (!value) throw new InvalidEstablishmentIdError('Establishment ID cannot be empty.');
    if (value.trim() === '')
      throw new InvalidEstablishmentIdError('Establishment ID cannot be empty.');
  }

  static fromString(value: string): EstablishmentId {
    if (!value) throw new InvalidEstablishmentIdError('Establishment ID cannot be empty.');
    if (value.trim() === '')
      throw new InvalidEstablishmentIdError('Establishment ID cannot be empty.');
    return new EstablishmentId(value);
  }

  equals(other: EstablishmentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
