export class InvalidEstablishmentDataError extends Error {
  constructor(message: string) {
    super(`Invalid establishment data: ${message}`);
    this.name = 'InvalidEstablishmentDataError';
  }
}

export class EstablishmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Establishment with ID ${id} not found.`);
    this.name = 'EstablishmentNotFoundError';
  }
}

export class EstablishmentNotOwnedError extends Error {
  constructor(id: string) {
    super(`Establishment with ID ${id} does not belong to the requester.`);
    this.name = 'EstablishmentNotOwnedError';
  }
}
