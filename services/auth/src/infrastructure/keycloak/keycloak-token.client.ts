import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { IdentityTokens } from '@/application/port/identity-provider.port';

type KeycloakTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

@Injectable()
export class KeycloakTokenClient {
  private readonly realmUrl =
    process.env.KEYCLOAK_INTERNAL_URL ?? 'http://keycloak:8080/realms/mini-food';
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'mini-food-client';

  async login(email: string, password: string): Promise<IdentityTokens> {
    return this.requestToken({
      grant_type: 'password',
      username: email,
      password,
    });
  }

  async refresh(refreshToken: string): Promise<IdentityTokens> {
    return this.requestToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  private async requestToken(params: Record<string, string>): Promise<IdentityTokens> {
    const response = await fetch(`${this.realmUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Connection: 'close' },
      keepalive: false,
      body: new URLSearchParams({
        client_id: this.clientId,
        ...params,
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const data = (await response.json()) as KeycloakTokenResponse;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }
}
