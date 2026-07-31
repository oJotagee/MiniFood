import { Inject, Injectable } from '@nestjs/common';

import type { IdentityProvider } from '../port/identity-provider.port';
import { UserEntity, UserRole } from '@/domain/entities/user.entity';
import { UserAlreadyExistsError } from '@/domain/errors/user.error';
import { IDENTITY_PROVIDER } from '../port/identity-provider.port';
import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';
import { Email } from '@/domain/value-objects/email.vo';

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type RegisterUserOutput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,

    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create({ value: input.email });

    const existing = await this.users.findByEmail(email.toString());

    if (existing) throw new UserAlreadyExistsError(email.toString());

    const { sub } = await this.identityProvider.register({
      email: email.toString(),
      password: input.password,
      name: input.name,
      role: input.role,
    });

    const user = UserEntity.create({
      id: sub,
      name: input.name,
      email,
      role: input.role,
    });

    await this.users.create(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
