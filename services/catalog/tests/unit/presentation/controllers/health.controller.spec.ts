import { describe, expect, it } from 'bun:test';

import { HealthController } from '@/presentation/controllers/health.controller';

describe('HealthController', () => {
  it('returns the service health status', () => {
    const controller = new HealthController();

    expect(controller.check()).toEqual({ status: 'ok', service: 'wallets' });
  });
});
