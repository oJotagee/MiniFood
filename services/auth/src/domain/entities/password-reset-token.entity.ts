import { createHash, randomBytes } from 'node:crypto';

import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenAlreadyUsedError,
  PasswordResetTokenExpiredError,
} from '../errors/password-reset-token.error';

const TOKEN_TTL_MS = 60 * 60 * 1000;

type PasswordResetTokenProps = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
};

type PasswordResetTokenRestoreInput = PasswordResetTokenProps;

export class PasswordResetTokenEntity {
  private constructor(private readonly props: PasswordResetTokenProps) {
    PasswordResetTokenEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get usedAt(): Date | undefined {
    return this.props.usedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static issue(input: { id: string; userId: string }): {
    entity: PasswordResetTokenEntity;
    rawToken: string;
  } {
    const rawToken = randomBytes(32).toString('hex');
    const now = new Date();

    const entity = new PasswordResetTokenEntity({
      id: input.id,
      userId: input.userId,
      tokenHash: PasswordResetTokenEntity.hash(rawToken),
      expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
      createdAt: now,
    });

    return { entity, rawToken };
  }

  static restore(input: PasswordResetTokenRestoreInput): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity({ ...input });
  }

  static hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  markAsUsed(): PasswordResetTokenEntity {
    this.assertUsable();

    return new PasswordResetTokenEntity({ ...this.props, usedAt: new Date() });
  }

  assertUsable(): void {
    if (this.props.usedAt) throw new PasswordResetTokenAlreadyUsedError();
    if (this.props.expiresAt.getTime() < Date.now()) throw new PasswordResetTokenExpiredError();
  }

  private static validate(props: PasswordResetTokenProps): void {
    if (!props.id.trim()) throw new InvalidPasswordResetTokenError('Token id cannot be empty.');
    if (!props.userId.trim()) throw new InvalidPasswordResetTokenError('User id cannot be empty.');
    if (!props.tokenHash.trim())
      throw new InvalidPasswordResetTokenError('Token hash cannot be empty.');
  }
}
