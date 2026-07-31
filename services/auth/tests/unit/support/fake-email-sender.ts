import type { EmailSender } from '@/application/port/email-sender.port';

export class FakeEmailSender implements EmailSender {
  passwordResetEmails: { to: string; name: string; resetToken: string }[] = [];
  twoFactorEmails: { to: string; name: string; code: string }[] = [];

  async sendPasswordResetEmail(input: {
    to: string;
    name: string;
    resetToken: string;
  }): Promise<void> {
    this.passwordResetEmails.push(input);
  }

  async sendTwoFactorCode(input: { to: string; name: string; code: string }): Promise<void> {
    this.twoFactorEmails.push(input);
  }
}
