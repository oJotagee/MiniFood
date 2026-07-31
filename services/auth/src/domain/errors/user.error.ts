export class InvalidUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserError';
  }
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with ID ${id} not found.`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists.`);
    this.name = 'UserAlreadyExistsError';
  }
}
