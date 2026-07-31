import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { USER_REPOSITORY } from '../port/user-repository.port';
import { UserRole } from '@/domain/entities/user.entity';

type FindUserByIdOutput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute({ id }: { id: string }): Promise<FindUserByIdOutput> {
    const user = await this.users.findById(id);

    if (!user) throw new UserNotFoundError(id);

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
