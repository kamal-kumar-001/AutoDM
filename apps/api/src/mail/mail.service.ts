import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '../config/config.service';
import { AppLogger } from '../common/logger/logger.service';

@Injectable()
export class MailService {
  private resend: Resend | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('MailService');
    this.initializeResend();
  }

  private initializeResend() {
    // If SMTP_PASSWORD is a Resend API key (starts with "re_"), or if they provide a dedicated env variable, use it!
    const apiKey = this.configService.get('SMTP_PASSWORD') || process.env.RESEND_API_KEY;

    if (apiKey && (apiKey.startsWith('re_') || process.env.RESEND_API_KEY)) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend Mail client configured successfully.');
    } else {
      this.logger.warn(
        'No Resend API Key / SMTP configuration found. Emails will be logged to the console.',
      );
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const from = this.configService.get('SMTP_FROM') || 'onboarding@resend.dev';

    if (this.resend) {
      try {
        const { data, error } = await this.resend.emails.send({
          from,
          to: [to],
          subject,
          html,
          text,
        });

        if (error) {
          this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
          throw new Error(error.message);
        }

        this.logger.log(`Email sent successfully to ${to} (id: ${data?.id})`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${to}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    } else {
      this.logger.log(`
=======================================
[MOCK EMAIL OUTBOX]
To: ${to}
Subject: ${subject}
Plain Text: ${text || 'N/A'}
HTML Content: ${html.replace(/\s+/g, ' ')}
=======================================`);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    const html = `
      <h1>Verify your Email Address</h1>
      <p>Thank you for registering at AutoDM! Please click the button below to verify your email:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #00BB88; color: #030712; font-weight: bold; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `;
    const text = `Verify your Email at: ${verificationUrl}`;
    await this.sendEmail(to, 'Verify your email address - AutoDM', html, text);
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const html = `
      <h1>Reset your Password</h1>
      <p>We received a request to reset your password. Please click the button below to update your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #00BB88; color: #030712; font-weight: bold; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email. This link is valid for 1 hour.</p>
    `;
    const text = `Reset your password at: ${resetUrl}`;
    await this.sendEmail(to, 'Reset your password - AutoDM', html, text);
  }
}
