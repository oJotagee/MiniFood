import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

import { InvalidEmailError } from '@/domain/errors/email.error';
import {
  InvalidUserError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '@/domain/errors/user.error';
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

type HttpResponse = {
  status: (statusCode: number) => HttpResponse;
  json: (body: Record<string, unknown>) => void;
};

type HttpRequest = {
  url: string;
};

type DomainError =
  | InvalidEmailError
  | InvalidUserError
  | UserNotFoundError
  | UserAlreadyExistsError
  | InvalidPasswordResetTokenError
  | PasswordResetTokenAlreadyUsedError
  | PasswordResetTokenExpiredError
  | InvalidTwoFactorChallengeError
  | InvalidTwoFactorCodeError
  | TwoFactorChallengeAlreadyUsedError
  | TwoFactorChallengeExpiredError
  | TwoFactorChallengeTooManyAttemptsError;

const STATUS_BY_ERROR = new Map<Function, { statusCode: number; error: string }>([
  [InvalidEmailError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidUserError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [UserNotFoundError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [UserAlreadyExistsError, { statusCode: HttpStatus.CONFLICT, error: 'Conflict' }],
  [InvalidPasswordResetTokenError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [PasswordResetTokenAlreadyUsedError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [PasswordResetTokenExpiredError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidTwoFactorChallengeError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidTwoFactorCodeError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [TwoFactorChallengeAlreadyUsedError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [TwoFactorChallengeExpiredError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [
    TwoFactorChallengeTooManyAttemptsError,
    { statusCode: HttpStatus.TOO_MANY_REQUESTS, error: 'TooManyRequests' },
  ],
]);

@Catch(
  InvalidEmailError,
  InvalidUserError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidPasswordResetTokenError,
  PasswordResetTokenAlreadyUsedError,
  PasswordResetTokenExpiredError,
  InvalidTwoFactorChallengeError,
  InvalidTwoFactorCodeError,
  TwoFactorChallengeAlreadyUsedError,
  TwoFactorChallengeExpiredError,
  TwoFactorChallengeTooManyAttemptsError,
)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const mapping = STATUS_BY_ERROR.get(exception.constructor) ?? {
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'BadRequest',
    };

    const request = host.switchToHttp().getRequest<HttpRequest>();
    const response = host.switchToHttp().getResponse<HttpResponse>();

    response.status(mapping.statusCode).json({
      statusCode: mapping.statusCode,
      message: exception.message,
      error: mapping.error,
      path: request.url,
    });
  }
}
