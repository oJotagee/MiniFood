import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it, mock } from 'bun:test';
import type { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { RolesGuard } from '@/infrastructure/auth/roles.guard';

function makeContext(user?: AuthenticatedRequest['user']): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

function makeReflector(requiredRoles: string[] | undefined): Reflector {
  return {
    getAllAndOverride: mock(() => requiredRoles),
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const guard = new RolesGuard(makeReflector(undefined));

    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('allows access when the required roles list is empty', () => {
    const guard = new RolesGuard(makeReflector([]));

    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('allows access when the user has one of the required roles', () => {
    const guard = new RolesGuard(makeReflector(['admin', 'owner']));

    const context = makeContext({ userId: 'u1', username: 'u1', roles: ['owner'] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when the user lacks the required roles', () => {
    const guard = new RolesGuard(makeReflector(['admin']));

    const context = makeContext({ userId: 'u1', username: 'u1', roles: ['customer'] });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies access when the request has no user', () => {
    const guard = new RolesGuard(makeReflector(['admin']));

    expect(() => guard.canActivate(makeContext())).toThrow(ForbiddenException);
  });
});
