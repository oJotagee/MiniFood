import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { UserRole } from '@/domain/entities/user.entity';

type SetTwoFactorEnabledInput = {
  id: string;
  enabled: boolean;
};

type SetTwoFactorEnabledOutput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class SetTwoFactorEnabledUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute(input: SetTwoFactorEnabledInput): Promise<SetTwoFactorEnabledOutput> {
    const user = await this.users.findById(input.id);

    if (!user) throw new UserNotFoundError(input.id);

    const updatedUser = user.setTwoFactorEnabled(input.enabled);

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
