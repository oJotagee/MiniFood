import { Injectable } from '@nestjs/common';

import type { IdentityProvider, IdentityTokens } from '@/application/port/identity-provider.port';
import type { UserRole } from '@/domain/entities/user.entity';
import { KeycloakAdminClient } from './keycloak-admin.client';
import { KeycloakTokenClient } from './keycloak-token.client';

const REALM_ROLE_BY_USER_ROLE: Record<UserRole, string> = {
  customer: 'customer',
  establishment: 'company',
  courier: 'courier',
};

@Injectable()
export class KeycloakIdentityProvider implements IdentityProvider {
  constructor(
    private readonly adminClient: KeycloakAdminClient,
    private readonly tokenClient: KeycloakTokenClient,
  ) {}

  async register(input: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<{ sub: string }> {
    return this.adminClient.createUser({
      email: input.email,
      password: input.password,
      name: input.name,
      realmRole: REALM_ROLE_BY_USER_ROLE[input.role],
    });
  }

  async login(email: string, password: string): Promise<IdentityTokens> {
    return this.tokenClient.login(email, password);
  }

  async refreshToken(refreshToken: string): Promise<IdentityTokens> {
    return this.tokenClient.refresh(refreshToken);
  }

  async setPassword(userId: string, newPassword: string): Promise<void> {
    await this.adminClient.resetPassword(userId, newPassword);
  }
}
