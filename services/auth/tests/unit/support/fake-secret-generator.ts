import type { SecretGenerator } from '@/application/port/secret-generator.port';

export class FakeSecretGenerator implements SecretGenerator {
  private tokenSequence = 0;
  private codeSequence = 0;

  generateToken(): string {
    this.tokenSequence += 1;
    return `token-${this.tokenSequence}`;
  }

  generateVerificationCode(): string {
    this.codeSequence += 1;
    return this.codeSequence.toString().padStart(6, '0');
  }

  hash(value: string): string {
    return `hash:${value}`;
  }
}
