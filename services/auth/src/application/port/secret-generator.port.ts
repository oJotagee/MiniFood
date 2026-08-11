export const SECRET_GENERATOR = Symbol('SECRET_GENERATOR');

export interface SecretGenerator {
  generateToken(): string;
  generateVerificationCode(): string;
  hash(value: string): string;
}
