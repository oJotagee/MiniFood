import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';

type PasswordResetTokenPersistence = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export class PasswordResetTokenMapper {
  static toDomain(raw: PasswordResetTokenPersistence): PasswordResetTokenEntity {
    return PasswordResetTokenEntity.restore({
      id: raw.id,
      userId: raw.userId,
      tokenHash: raw.tokenHash,
      expiresAt: raw.expiresAt,
      usedAt: raw.usedAt ?? undefined,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(token: PasswordResetTokenEntity) {
    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt ?? null,
      createdAt: token.createdAt,
    };
  }
}
