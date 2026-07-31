import { Injectable } from '@nestjs/common';

import { UserRepository } from '@/application/port/user-repository.port';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserMapper } from '../persistence/user.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async create(user: UserEntity): Promise<void> {
    const persistence = UserMapper.toPersistence(user);

    await this.prismaService.user.create({ data: persistence });
  }

  async update(user: UserEntity): Promise<void> {
    const persistence = UserMapper.toPersistence(user);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        name: persistence.name,
        email: persistence.email,
        twoFactorEnabled: persistence.twoFactorEnabled,
      },
    });
  }
}
