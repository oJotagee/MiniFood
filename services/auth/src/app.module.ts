import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PasswordResetTokenPrismaRepository } from './infrastructure/repositories/password-reset-token-prisma.repository';
import { TwoFactorChallengePrismaRepository } from './infrastructure/repositories/two-factor-challenge-prisma.repository';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from './application/port/password-reset-token-repository.port';
import { TWO_FACTOR_CHALLENGE_REPOSITORY } from './application/port/two-factor-challenge-repository.port';
import { ResetPasswordConfirmUseCase } from './application/use-cases/reset-password-confirm.use-case';
import { ResetPasswordRequestUseCase } from './application/use-cases/reset-password-request.use-case';
import { SetTwoFactorEnabledUseCase } from './application/use-cases/set-two-factor-enabled.use-case';
import { KeycloakIdentityProvider } from './infrastructure/keycloak/keycloak-identity-provider';
import { VerifyTwoFactorUseCase } from './application/use-cases/verify-two-factor.use-case';
import { UserPrismaRepository } from './infrastructure/repositories/user-prisma.repository';
import { CryptoSecretGenerator } from './infrastructure/security/crypto-secret-generator';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { KeycloakAdminClient } from './infrastructure/keycloak/keycloak-admin.client';
import { KeycloakTokenClient } from './infrastructure/keycloak/keycloak-token.client';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { HealthController } from './presentation/controllers/health.controller';
import { IDENTITY_PROVIDER } from './application/port/identity-provider.port';
import { UserController } from './presentation/controllers/user.controller';
import { SECRET_GENERATOR } from './application/port/secret-generator.port';
import { SmtpEmailSender } from './infrastructure/email/smtp-email-sender';
import { USER_REPOSITORY } from './application/port/user-repository.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { TokenCipher } from './infrastructure/security/token-cipher';
import { EMAIL_SENDER } from './application/port/email-sender.port';

@Module({
  imports: [],
  controllers: [HealthController, UserController],
  providers: [
    PrismaService,
    TokenCipher,
    {
      provide: SECRET_GENERATOR,
      useClass: CryptoSecretGenerator,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // USER_USE_CASES
    RegisterUserUseCase,
    LoginUseCase,
    VerifyTwoFactorUseCase,
    FindUserByIdUseCase,
    UpdateProfileUseCase,
    SetTwoFactorEnabledUseCase,
    RefreshTokenUseCase,
    ResetPasswordRequestUseCase,
    ResetPasswordConfirmUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY,
      useClass: PasswordResetTokenPrismaRepository,
    },
    {
      provide: TWO_FACTOR_CHALLENGE_REPOSITORY,
      useClass: TwoFactorChallengePrismaRepository,
    },
    {
      provide: EMAIL_SENDER,
      useClass: SmtpEmailSender,
    },
    // KEYCLOAK
    KeycloakAdminClient,
    KeycloakTokenClient,
    {
      provide: IDENTITY_PROVIDER,
      useClass: KeycloakIdentityProvider,
    },
  ],
})
export class AppModule { }
