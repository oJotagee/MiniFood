export class InvalidEstablishmentDataError extends Error {
  constructor(message: string) {
    super(`Invalid establishment data: ${message}`);
    this.name = 'InvalidEstablishmentDataError';
  }
}
