import { describe, expect, it } from 'bun:test';
import type { ArgumentsHost } from '@nestjs/common';

import { InvalidEmailError } from '@/domain/errors/email.error';
import { InvalidUserError, UserAlreadyExistsError, UserNotFoundError } from '@/domain/errors/user.error';
import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenAlreadyUsedError,
  PasswordResetTokenExpiredError,
} from '@/domain/errors/password-reset-token.error';
import {
  InvalidTwoFactorChallengeError,
  InvalidTwoFactorCodeError,
  TwoFactorChallengeAlreadyUsedError,
  TwoFactorChallengeExpiredError,
  TwoFactorChallengeTooManyAttemptsError,
} from '@/domain/errors/two-factor-challenge.error';
import { DomainExceptionFilter } from '@/presentation/filters/domain-exception.filter';

function buildHost(url = '/users/me') {
  const json = (body: Record<string, unknown>) => {
    captured.body = body;
  };
  const status = (statusCode: number) => {
    captured.statusCode = statusCode;
    return { status, json };
  };
  const captured: { statusCode?: number; body?: Record<string, unknown> } = {};

  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ url }),
      getResponse: () => ({ status, json }),
    }),
  } as unknown as ArgumentsHost;

  return { host, captured };
}

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  it.each([
    [new InvalidEmailError('Email is invalid.'), 400, 'BadRequest'],
    [new InvalidUserError('User name cannot be empty.'), 400, 'BadRequest'],
    [new UserNotFoundError('user-1'), 404, 'NotFound'],
    [new UserAlreadyExistsError('joao@example.com'), 409, 'Conflict'],
    [new InvalidPasswordResetTokenError('Reset token is invalid.'), 400, 'BadRequest'],
    [new PasswordResetTokenAlreadyUsedError(), 400, 'BadRequest'],
    [new PasswordResetTokenExpiredError(), 400, 'BadRequest'],
    [new InvalidTwoFactorChallengeError('Challenge not found.'), 400, 'BadRequest'],
    [new InvalidTwoFactorCodeError(), 400, 'BadRequest'],
    [new TwoFactorChallengeAlreadyUsedError(), 400, 'BadRequest'],
    [new TwoFactorChallengeExpiredError(), 400, 'BadRequest'],
    [new TwoFactorChallengeTooManyAttemptsError(), 429, 'TooManyRequests'],
  ])('maps %p to statusCode %i / error %s', (exception, statusCode, error) => {
    const { host, captured } = buildHost();

    filter.catch(exception as Error, host);

    expect(captured.statusCode).toBe(statusCode);
    expect(captured.body).toEqual({
      statusCode,
      message: exception.message,
      error,
      path: '/users/me',
    });
  });

  it('includes the request path in the response body', () => {
    const { host, captured } = buildHost('/users/register');

    filter.catch(new UserAlreadyExistsError('joao@example.com'), host);

    expect(captured.body?.path).toBe('/users/register');
  });
});
