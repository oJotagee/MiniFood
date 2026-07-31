import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

import type { EmailSender } from '@/application/port/email-sender.port';

@Injectable()
export class SmtpEmailSender implements EmailSender {
  private readonly logger = new Logger(SmtpEmailSender.name);
  private readonly appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  private readonly from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@minifood.dev';
  private readonly transporter: Transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendPasswordResetEmail(input: {
    to: string;
    name: string;
    resetToken: string;
  }): Promise<void> {
    const resetLink = `${this.appUrl}/reset-password?token=${input.resetToken}`;

    await this.send({
      to: input.to,
      subject: 'Redefinição de senha — MiniFood',
      html: `
        <p>Olá, ${input.name},</p>
        <p>Recebemos um pedido para redefinir sua senha. Clique no link abaixo para continuar:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Se você não pediu isso, ignore este e-mail. O link expira em 1 hora.</p>
      `,
    });
  }

  async sendTwoFactorCode(input: { to: string; name: string; code: string }): Promise<void> {
    await this.send({
      to: input.to,
      subject: 'Seu código de verificação — MiniFood',
      html: `
        <p>Olá, ${input.name},</p>
        <p>Seu código de verificação é:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${input.code}</p>
        <p>Ele expira em 5 minutos. Se você não tentou fazer login, ignore este e-mail.</p>
      `,
    });
  }

  private async send(input: { to: string; subject: string; html: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${input.to}`, error as Error);
      throw error;
    }
  }
}
