import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { InvalidUserError } from '../errors/user.error';
import { Email } from '../value-objects/email.vo';

export type UserRole = 'customer' | 'establishment' | 'courier';

export type UserDomainEvent = UserRegisteredEvent | UserProfileUpdatedEvent;

type UserProps = {
  id: string;
  name: string;
  email: Email;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserCreateInput = {
  id: string;
  name: string;
  email: Email;
  role: UserRole;
};

type UserUpdateInput = {
  name?: string;
  email?: Email;
};

type UserRestoreInput = {
  id: string;
  name: string;
  email: Email;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class UserEntity {
  private readonly domainEvents: UserDomainEvent[] = [];

  private constructor(private readonly userProps: UserProps) {
    UserEntity.validate(userProps);
  }

  get id(): string {
    return this.userProps.id;
  }

  get name(): string {
    return this.userProps.name;
  }

  get email(): Email {
    return this.userProps.email;
  }

  get role(): UserRole {
    return this.userProps.role;
  }

  get twoFactorEnabled(): boolean {
    return this.userProps.twoFactorEnabled;
  }

  get createdAt(): Date {
    return this.userProps.createdAt;
  }

  get updatedAt(): Date {
    return this.userProps.updatedAt;
  }

  static create(input: UserCreateInput): UserEntity {
    const now = new Date();

    const user = new UserEntity({
      id: input.id,
      name: input.name,
      email: input.email,
      role: input.role,
      twoFactorEnabled: false,
      createdAt: now,
      updatedAt: now,
    });

    user.recordDomainEvent({
      type: 'user.registered',
      occurredAt: now,
      payload: {
        userId: user.id,
        email: user.email.toString(),
        name: user.name,
        role: user.role,
      },
    });

    return user;
  }

  static restore(input: UserRestoreInput): UserEntity {
    return new UserEntity({ ...input });
  }

  updateProfile(input: UserUpdateInput): UserEntity {
    const now = new Date();

    const user = new UserEntity({
      id: this.id,
      name: input.name ?? this.name,
      email: input.email ?? this.email,
      role: this.role,
      twoFactorEnabled: this.twoFactorEnabled,
      createdAt: this.createdAt,
      updatedAt: now,
    });

    user.recordDomainEvent({
      type: 'user.profile-updated',
      occurredAt: now,
      payload: {
        userId: user.id,
        email: user.email.toString(),
        name: user.name,
      },
    });

    return user;
  }

  setTwoFactorEnabled(enabled: boolean): UserEntity {
    return new UserEntity({
      ...this.userProps,
      twoFactorEnabled: enabled,
      updatedAt: new Date(),
    });
  }

  private static validate(props: UserProps) {
    if (!props.id.trim()) throw new InvalidUserError('User not found.');
    if (!props.name.trim()) throw new InvalidUserError('User name cannot be empty.');
  }

  private recordDomainEvent(event: UserDomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): UserDomainEvent[] {
    return this.domainEvents.splice(0, this.domainEvents.length);
  }
}
