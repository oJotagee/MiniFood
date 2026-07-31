import { Injectable, InternalServerErrorException } from '@nestjs/common';

type KeycloakTokenResponse = {
  access_token: string;
  expires_in: number;
};

type KeycloakUserRepresentation = {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
};

@Injectable()
export class KeycloakAdminClient {
  private readonly realmUrl =
    process.env.KEYCLOAK_INTERNAL_URL ?? 'http://keycloak:8080/realms/mini-food';
  private readonly adminBaseUrl =
    process.env.KEYCLOAK_ADMIN_URL ?? 'http://keycloak:8080/admin/realms/mini-food';
  private readonly adminClientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID ?? 'auth-service-admin';
  private readonly adminClientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET ?? '';

  private cachedToken: { value: string; expiresAt: number } | null = null;

  async createUser(input: {
    email: string;
    password: string;
    name: string;
    realmRole: string;
  }): Promise<{ sub: string }> {
    const token = await this.getServiceAccountToken();

    const response = await fetch(`${this.adminBaseUrl}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Connection: 'close',
      },
      keepalive: false,
      body: JSON.stringify({
        username: input.email,
        email: input.email,
        firstName: input.name,
        enabled: true,
        emailVerified: false,
        credentials: [{ type: 'password', value: input.password, temporary: false }],
      }),
    });

    if (response.status !== 201) {
      const body = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Failed to create user on identity provider (${response.status}): ${body}`,
      );
    }

    const location = response.headers.get('Location');
    const sub = location?.split('/').pop();

    if (!sub) {
      throw new InternalServerErrorException('Identity provider did not return a user id.');
    }

    await this.assignRealmRole(sub, input.realmRole, token);

    return { sub };
  }

  private async assignRealmRole(userId: string, roleName: string, token: string): Promise<void> {
    const roleResponse = await fetch(`${this.adminBaseUrl}/roles/${roleName}`, {
      headers: { Authorization: `Bearer ${token}`, Connection: 'close' },
      keepalive: false,
    });

    if (!roleResponse.ok) {
      const body = await roleResponse.text().catch(() => '');
      throw new InternalServerErrorException(
        `Failed to find realm role "${roleName}" on identity provider (${roleResponse.status}): ${body}`,
      );
    }

    const role = await roleResponse.json();

    const assignResponse = await fetch(`${this.adminBaseUrl}/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Connection: 'close',
      },
      keepalive: false,
      body: JSON.stringify([role]),
    });

    if (!assignResponse.ok) {
      const body = await assignResponse.text().catch(() => '');
      throw new InternalServerErrorException(
        `Failed to assign realm role "${roleName}" on identity provider (${assignResponse.status}): ${body}`,
      );
    }
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const token = await this.getServiceAccountToken();

    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Connection: 'close',
      },
      keepalive: false,
      body: JSON.stringify({ type: 'password', value: newPassword, temporary: false }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Failed to reset password on identity provider (${response.status}): ${body}`,
      );
    }
  }

  async findUserByEmail(email: string): Promise<KeycloakUserRepresentation | null> {
    const accessToken = await this.getServiceAccountToken();

    const response = await fetch(
      `${this.adminBaseUrl}/users?email=${encodeURIComponent(email)}&exact=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}`, Connection: 'close' },
        keepalive: false,
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Failed to query identity provider (${response.status}): ${body}`,
      );
    }

    const users = (await response.json()) as KeycloakUserRepresentation[];

    return users[0] ?? null;
  }

  private async getServiceAccountToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.value;
    }

    const response = await fetch(`${this.realmUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Connection: 'close' },
      keepalive: false,
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.adminClientId,
        client_secret: this.adminClientSecret,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Failed to authenticate with identity provider (${response.status}): ${body}`,
      );
    }

    const data = (await response.json()) as KeycloakTokenResponse;

    this.cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 30) * 1000,
    };

    return this.cachedToken.value;
  }
}
