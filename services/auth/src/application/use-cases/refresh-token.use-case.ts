import { Inject, Injectable } from '@nestjs/common';

import type { IdentityProvider, IdentityTokens } from '../port/identity-provider.port';
import { IDENTITY_PROVIDER } from '../port/identity-provider.port';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {}

  async execute({ refreshToken }: { refreshToken: string }): Promise<IdentityTokens> {
    return this.identityProvider.refreshToken(refreshToken);
  }
}
