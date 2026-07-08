export class AddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AddressError';
  }
}
