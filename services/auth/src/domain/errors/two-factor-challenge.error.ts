export class InvalidTwoFactorChallengeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTwoFactorChallengeError';
  }
}

export class TwoFactorChallengeExpiredError extends Error {
  constructor() {
    super('Two-factor challenge has expired.');
    this.name = 'TwoFactorChallengeExpiredError';
  }
}

export class TwoFactorChallengeAlreadyUsedError extends Error {
  constructor() {
    super('Two-factor challenge has already been used.');
    this.name = 'TwoFactorChallengeAlreadyUsedError';
  }
}

export class TwoFactorChallengeTooManyAttemptsError extends Error {
  constructor() {
    super('Too many attempts for this two-factor challenge.');
    this.name = 'TwoFactorChallengeTooManyAttemptsError';
  }
}

export class InvalidTwoFactorCodeError extends Error {
  constructor() {
    super('Invalid two-factor code.');
    this.name = 'InvalidTwoFactorCodeError';
  }
}
