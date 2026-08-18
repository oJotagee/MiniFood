import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'bun:test';
import type { JWTPayload } from 'jose';

import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

type StubRequest = { headers: { authorization?: string }; user?: unknown };

class StubJwtAuthGuard extends JwtAuthGuard {
  constructor(private readonly payload: JWTPayload | Error) {
    super();
  }

  protected override async verifyJwtSignature(): Promise<JWTPayload> {
    if (this.payload instanceof Error) throw this.payload;
    return this.payload;
  }
}

function makeContext(request: StubRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'mini-food-client';

describe('JwtAuthGuard', () => {
  it('rejects requests without a bearer token', async () => {
    const guard = new StubJwtAuthGuard({});
    const request: StubRequest = { headers: {} };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a malformed authorization header', async () => {
    const guard = new StubJwtAuthGuard({});
    const request: StubRequest = { headers: { authorization: 'Token abc' } };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when signature verification fails', async () => {
    const guard = new StubJwtAuthGuard(new Error('bad signature'));
    const request: StubRequest = { headers: { authorization: 'Bearer bad-token' } };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token not issued for this client', async () => {
    const guard = new StubJwtAuthGuard({
      sub: 'user-1',
      azp: 'other-client',
      aud: ['other-client'],
    });
    const request: StubRequest = { headers: { authorization: 'Bearer good-token' } };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token payload without a subject', async () => {
    const guard = new StubJwtAuthGuard({ azp: clientId });
    const request: StubRequest = { headers: { authorization: 'Bearer good-token' } };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow(UnauthorizedException);
  });

  it('populates request.user and allows access for a valid token', async () => {
    const guard = new StubJwtAuthGuard({
      sub: 'user-1',
      preferred_username: 'joao',
      email: 'joao@example.com',
      azp: clientId,
      realm_access: { roles: ['customer'] },
    });
    const request: StubRequest = { headers: { authorization: 'Bearer good-token' } };

    const result = await guard.canActivate(makeContext(request));

    expect(result).toBe(true);
    expect(request.user).toEqual({
      userId: 'user-1',
      username: 'joao',
      email: 'joao@example.com',
      roles: ['customer'],
    });
  });

  it('accepts a client id present in the audience list instead of azp', async () => {
    const guard = new StubJwtAuthGuard({ sub: 'user-1', aud: [clientId] });
    const request: StubRequest = { headers: { authorization: 'Bearer good-token' } };

    const result = await guard.canActivate(makeContext(request));

    expect(result).toBe(true);
  });

  it('falls back to sub and empty roles when optional claims are missing', async () => {
    const guard = new StubJwtAuthGuard({ sub: 'user-1', azp: clientId });
    const request: StubRequest = { headers: { authorization: 'Bearer good-token' } };

    await guard.canActivate(makeContext(request));

    expect(request.user).toEqual({
      userId: 'user-1',
      username: 'user-1',
      email: undefined,
      roles: [],
    });
  });
});
