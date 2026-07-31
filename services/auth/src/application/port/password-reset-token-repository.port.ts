import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol('PASSWORD_RESET_TOKEN_REPOSITORY');

export interface PasswordResetTokenRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null>;
  create(token: PasswordResetTokenEntity): Promise<void>;
  markAsUsed(token: PasswordResetTokenEntity): Promise<void>;
}
