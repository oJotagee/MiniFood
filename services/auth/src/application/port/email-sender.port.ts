export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSender {
  sendPasswordResetEmail(input: { to: string; name: string; resetToken: string }): Promise<void>;
  sendTwoFactorCode(input: { to: string; name: string; code: string }): Promise<void>;
}
