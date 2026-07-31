import { UserRole as PrismaUserRole } from '@generated/prisma/enums';

import { UserEntity, UserRole } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

type UserPersistence = {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class UserMapper {
  static toDomain(raw: UserPersistence): UserEntity {
    return UserEntity.restore({
      id: raw.id,
      name: raw.name,
      email: Email.create({ value: raw.email }),
      role: raw.role.toLowerCase() as UserRole,
      twoFactorEnabled: raw.twoFactorEnabled,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      role: user.role.toUpperCase() as PrismaUserRole,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
