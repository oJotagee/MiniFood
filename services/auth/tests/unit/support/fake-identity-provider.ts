import type { UserRole } from '@/domain/entities/user.entity';
import type { IdentityProvider, IdentityTokens } from '@/application/port/identity-provider.port';

export class FakeIdentityProvider implements IdentityProvider {
  registerCalls: { email: string; password: string; name: string; role: UserRole }[] = [];
  loginCalls: { email: string; password: string }[] = [];
  refreshTokenCalls: string[] = [];
  setPasswordCalls: { userId: string; newPassword: string }[] = [];

  nextTokens: IdentityTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 300,
  };

  async register(input: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<{ sub: string }> {
    this.registerCalls.push(input);

    return { sub: `keycloak-${input.email}` };
  }

  async login(email: string, password: string): Promise<IdentityTokens> {
    this.loginCalls.push({ email, password });

    return this.nextTokens;
  }

  async refreshToken(refreshToken: string): Promise<IdentityTokens> {
    this.refreshTokenCalls.push(refreshToken);

    return this.nextTokens;
  }

  async setPassword(userId: string, newPassword: string): Promise<void> {
    this.setPasswordCalls.push({ userId, newPassword });
  }
}
