import { createHash, randomBytes, randomInt } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { SecretGenerator } from '@/application/port/secret-generator.port';

@Injectable()
export class CryptoSecretGenerator implements SecretGenerator {
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  generateVerificationCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
