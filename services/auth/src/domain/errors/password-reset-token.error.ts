export class InvalidPasswordResetTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordResetTokenError';
  }
}

export class PasswordResetTokenExpiredError extends Error {
  constructor() {
    super('Password reset token has expired.');
    this.name = 'PasswordResetTokenExpiredError';
  }
}

export class PasswordResetTokenAlreadyUsedError extends Error {
  constructor() {
    super('Password reset token has already been used.');
    this.name = 'PasswordResetTokenAlreadyUsedError';
  }
}
