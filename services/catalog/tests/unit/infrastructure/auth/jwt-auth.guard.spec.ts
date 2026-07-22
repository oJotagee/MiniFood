import { beforeAll, describe, expect, it } from 'bun:test';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

const ISSUER = 'http://localhost:8080/realms/mini-food';
const CLIENT_ID = 'mini-food-client';

let privateKey: CryptoKey;
let jwksJson: string;

function contextWithAuthorization(authorization?: string): ExecutionContext {
  const request: { headers: { authorization?: string }; user?: unknown } = {
    headers: { authorization },
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

async function signToken(
  overrides: Record<string, unknown> = {},
  kid = 'test-key',
): Promise<string> {
  return new SignJWT({
    preferred_username: 'joao',
    email: 'joao@example.com',
    realm_access: { roles: ['owner'] },
    azp: CLIENT_ID,
    ...overrides,
  })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setSubject((overrides.sub as string) ?? 'user-1')
    .setExpirationTime('10m')
    .sign(privateKey);
}

describe('JwtAuthGuard', () => {
  beforeAll(async () => {
    const { publicKey, privateKey: signingKey } = await generateKeyPair('RS256');
    privateKey = signingKey;

    const publicJwk = await exportJWK(publicKey);
    jwksJson = JSON.stringify({
      keys: [{ ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }],
    });

    process.env.KEYCLOAK_ISSUER = ISSUER;
    process.env.KEYCLOAK_CLIENT_ID = CLIENT_ID;
    process.env.KEYCLOAK_JWKS_JSON = jwksJson;
  });

  it('rejects requests without an authorization header', async () => {
    const guard = new JwtAuthGuard();

    await expect(guard.canActivate(contextWithAuthorization(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a malformed authorization header (no Bearer scheme)', async () => {
    const guard = new JwtAuthGuard();
    const token = await signToken();

    await expect(guard.canActivate(contextWithAuthorization(token))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a token with an invalid signature', async () => {
    const guard = new JwtAuthGuard();
    const { privateKey: otherKey } = await generateKeyPair('RS256');

    const forgedToken = await new SignJWT({ preferred_username: 'attacker' })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setSubject('user-1')
      .setExpirationTime('10m')
      .sign(otherKey);

    await expect(
      guard.canActivate(contextWithAuthorization(`Bearer ${forgedToken}`)),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token issued for a different client', async () => {
    const guard = new JwtAuthGuard();
    const token = await signToken({ azp: 'another-client' });

    await expect(guard.canActivate(contextWithAuthorization(`Bearer ${token}`))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a token without a subject claim', async () => {
    const guard = new JwtAuthGuard();
    const token = await new SignJWT({
      preferred_username: 'joao',
      azp: CLIENT_ID,
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setExpirationTime('10m')
      .sign(privateKey);

    await expect(guard.canActivate(contextWithAuthorization(`Bearer ${token}`))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('accepts a valid token and attaches the user to the request', async () => {
    const guard = new JwtAuthGuard();
    const token = await signToken({ sub: 'user-42' });
    const context = contextWithAuthorization(`Bearer ${token}`);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    const request = context.switchToHttp().getRequest<{ user: Record<string, unknown> }>();
    expect(request.user).toEqual({
      userId: 'user-42',
      username: 'joao',
      email: 'joao@example.com',
      roles: ['owner'],
    });
  });

  it('falls back to the subject as username when preferred_username is missing', async () => {
    const guard = new JwtAuthGuard();
    const token = await signToken({ sub: 'user-42', preferred_username: undefined });
    const context = contextWithAuthorization(`Bearer ${token}`);

    await guard.canActivate(context);

    const request = context.switchToHttp().getRequest<{ user: Record<string, unknown> }>();
    expect(request.user.username).toBe('user-42');
  });
});
