import type { UserRole } from '@/domain/entities/user.entity';

export const IDENTITY_PROVIDER = Symbol('IDENTITY_PROVIDER');

export type IdentityTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export interface IdentityProvider {
  register(input: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<{ sub: string }>;
  login(email: string, password: string): Promise<IdentityTokens>;
  refreshToken(refreshToken: string): Promise<IdentityTokens>;
  setPassword(userId: string, newPassword: string): Promise<void>;
}
