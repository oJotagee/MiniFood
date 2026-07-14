import { AddressError } from '../errors/address.error';

export type AddressProps = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export class Address {
  private constructor(private readonly props: AddressProps) {
    if (!props.street.trim()) throw new AddressError('Street must be provided.');
    if (!props.number.trim()) throw new AddressError('Number must be provided.');
    if (!props.neighborhood.trim()) throw new AddressError('Neighborhood must be provided.');
    if (!props.city.trim()) throw new AddressError('City must be provided.');
    if (!props.state.trim()) throw new AddressError('State must be provided.');
    if (!props.zipCode.trim()) throw new AddressError('Zip code must be provided.');
  }

  get street(): string {
    return this.props.street;
  }

  get number(): string {
    return this.props.number;
  }

  get complement(): string | undefined {
    return this.props.complement;
  }

  get neighborhood(): string {
    return this.props.neighborhood;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  static create(input: AddressProps): Address {
    return new Address({
      street: input.street.trim(),
      number: input.number.trim(),
      complement: input.complement?.trim() || undefined,
      neighborhood: input.neighborhood.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      zipCode: input.zipCode.trim(),
    });
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.number === other.number &&
      this.complement === other.complement &&
      this.neighborhood === other.neighborhood &&
      this.city === other.city &&
      this.state === other.state &&
      this.zipCode === other.zipCode
    );
  }

  toString(): string {
    const complement = this.complement ? `, ${this.complement}` : '';

    return `${this.street}, ${this.number}${complement}, ${this.neighborhood}, ${this.city}, ${this.state}, ${this.zipCode}`;
  }

  toJSON(): AddressProps {
    return {
      street: this.street,
      number: this.number,
      complement: this.complement,
      neighborhood: this.neighborhood,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
    };
  }
}
