import type { PasswordResetTokenRepository } from '@/application/port/password-reset-token-repository.port';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';

export class InMemoryPasswordResetTokenRepository implements PasswordResetTokenRepository {
  private readonly tokens = new Map<string, PasswordResetTokenEntity>();

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
    return [...this.tokens.values()].find((token) => token.tokenHash === tokenHash) ?? null;
  }

  async create(token: PasswordResetTokenEntity): Promise<void> {
    this.tokens.set(token.id, token);
  }

  async markAsUsed(token: PasswordResetTokenEntity): Promise<void> {
    this.tokens.set(token.id, token);
  }
}
