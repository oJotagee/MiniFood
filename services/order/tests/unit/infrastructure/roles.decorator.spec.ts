import { describe, expect, it } from 'bun:test';
import { Reflector } from '@nestjs/core';

import { Roles, ROLES_KEY } from '@/infrastructure/auth/roles.decorator';

describe('Roles decorator', () => {
  it('attaches the given roles under the roles metadata key', () => {
    class TestController {
      @Roles('admin', 'owner')
      handler(): void {}
    }

    const reflector = new Reflector();
    const roles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.handler);

    expect(roles).toEqual(['admin', 'owner']);
  });

  it('supports being called with no roles', () => {
    class TestController {
      @Roles()
      handler(): void {}
    }

    const reflector = new Reflector();
    const roles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.handler);

    expect(roles).toEqual([]);
  });
});
