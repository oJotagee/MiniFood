import { EstablishmentCreatedEvent } from '../events/establishment-created.event';
import { EstablishmentUpdatedEvent } from '../events/establishment-updated.event';
import { InvalidEstablishmentDataError } from './establishment.error';
import { Address, AddressProps } from '../address/address.vo';

export type EstablishmentDomainEvent = EstablishmentCreatedEvent | EstablishmentUpdatedEvent;

type EstablishmentProps = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
};

type EstablishmentCreateInput = {
  id: string;
  operationId: string;
  name: string;
  description?: string;
  ownerId: string;
  address: AddressProps;
};

type EstablishmentUpdateInput = {
  operationId: string;
  name?: string;
  description?: string;
  address?: AddressProps;
};

type EstablishmentRestoreInput = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  address: AddressProps;
};

export class EstablishmentEntity {
  private readonly domainEvents: EstablishmentDomainEvent[] = [];

  private constructor(private readonly establishmentProps: EstablishmentProps) {
    EstablishmentEntity.validate(establishmentProps);
  }

  get id(): string {
    return this.establishmentProps.id;
  }

  get name(): string {
    return this.establishmentProps.name;
  }

  get description(): string | undefined {
    return this.establishmentProps.description;
  }

  get ownerId(): string {
    return this.establishmentProps.ownerId;
  }

  get createdAt(): Date {
    return this.establishmentProps.createdAt;
  }

  get updatedAt(): Date {
    return this.establishmentProps.updatedAt;
  }

  get address(): Address {
    return this.establishmentProps.address;
  }

  static create(input: EstablishmentCreateInput): EstablishmentEntity {
    const now = new Date();

    const establishment = new EstablishmentEntity({
      id: input.id,
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
      address: Address.create(input.address),
    });

    establishment.recordDomainEvent({
      type: 'establishment.created',
      occurredAt: now,
      payload: {
        operationId: input.operationId,
        establishmentId: establishment.id,
        ownerId: establishment.ownerId,
        name: establishment.name,
        description: establishment.description,
        address: establishment.address.toJSON(),
      },
    });

    return establishment;
  }

  static restore(input: EstablishmentRestoreInput): EstablishmentEntity {
    return new EstablishmentEntity({
      id: input.id,
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      address: Address.create(input.address),
    });
  }

  update(input: EstablishmentUpdateInput): EstablishmentEntity {
    const now = new Date();

    const establishment = new EstablishmentEntity({
      id: this.id,
      name: input.name ?? this.name,
      description: input.description ?? this.description,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: now,
      address: input.address ? Address.create(input.address) : this.address,
    });

    establishment.recordDomainEvent({
      type: 'establishment.updated',
      occurredAt: now,
      payload: {
        operationId: input.operationId,
        establishmentId: establishment.id,
        ownerId: establishment.ownerId,
        name: establishment.name,
        description: establishment.description,
        address: establishment.address.toJSON(),
      },
    });

    return establishment;
  }

  private static validate(props: EstablishmentProps) {
    if (!props.id.trim()) throw new InvalidEstablishmentDataError('Establishment not found.');
    if (!props.name.trim())
      throw new InvalidEstablishmentDataError('Establishment name cannot be empty.');
    if (!props.ownerId.trim()) throw new InvalidEstablishmentDataError('Owner not found.');
  }

  private recordDomainEvent(event: EstablishmentDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): EstablishmentDomainEvent[] {
    return this.domainEvents.splice(0, this.domainEvents.length);
  }
}
