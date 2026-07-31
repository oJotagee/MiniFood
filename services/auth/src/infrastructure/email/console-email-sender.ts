import { Injectable, Logger } from '@nestjs/common';

import type { EmailSender } from '@/application/port/email-sender.port';

@Injectable()
export class ConsoleEmailSender implements EmailSender {
  private readonly logger = new Logger(ConsoleEmailSender.name);
  private readonly appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  async sendPasswordResetEmail(input: {
    to: string;
    name: string;
    resetToken: string;
  }): Promise<void> {
    const resetLink = `${this.appUrl}/reset-password?token=${input.resetToken}`;

    this.logger.log(
      `[password-reset] to=${input.to} name=${input.name} link=${resetLink}`,
    );
  }

  async sendTwoFactorCode(input: { to: string; name: string; code: string }): Promise<void> {
    this.logger.log(`[two-factor] to=${input.to} name=${input.name} code=${input.code}`);
  }
}
