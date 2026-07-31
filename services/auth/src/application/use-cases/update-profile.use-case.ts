import { Inject, Injectable } from '@nestjs/common';

import { UserAlreadyExistsError, UserNotFoundError } from '@/domain/errors/user.error';
import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';
import { UserRole } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

type UpdateProfileInput = {
  id: string;
  name?: string;
  email?: string;
};

type UpdateProfileOutput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<UpdateProfileOutput> {
    const user = await this.users.findById(input.id);

    if (!user) throw new UserNotFoundError(input.id);

    const email = input.email ? Email.create({ value: input.email }) : undefined;

    if (email && !email.equals(user.email)) {
      const existing = await this.users.findByEmail(email.toString());

      if (existing) throw new UserAlreadyExistsError(email.toString());
    }

    const updatedUser = user.updateProfile({
      name: input.name,
      email,
    });

    await this.users.update(updatedUser);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email.toString(),
      role: updatedUser.role,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
