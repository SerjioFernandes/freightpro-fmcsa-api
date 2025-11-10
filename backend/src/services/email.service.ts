import { Resend } from 'resend';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

class EmailService {
  private client: Resend | null = null;
  private sender: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const apiKey = config.RESEND_API_KEY?.trim();
    const senderEmail = config.EMAIL_USER?.trim();

    logger.info('Email configuration check', {
      apiKeySet: !!apiKey,
      senderSet: !!senderEmail
    });

    if (!apiKey) {
      logger.warn('RESEND_API_KEY environment variable is missing. Email notifications are disabled.');
      return;
    }

    if (!senderEmail) {
      logger.warn('EMAIL_USER environment variable is missing. Email notifications are disabled.');
      return;
    }

    this.client = new Resend(apiKey);
    this.sender = senderEmail.includes('<') ? senderEmail : `CargoLume <${senderEmail}>`;

    logger.info('Resend client initialized successfully', {
      sender: this.sender
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden">
        <div style="background:#1a2238; color:#fff; padding:16px 24px">
          <h1 style="margin:0; font-size:20px;">CargoLume</h1>
          <p style="margin:4px 0 0; font-size:12px; opacity:.9">Professional Load Board</p>
        </div>
        <div style="padding:24px">
          <h2 style="margin:0 0 8px; color:#111827; font-size:18px;">Verify your email</h2>
          <p style="margin:0 0 16px; color:#374151;">Thanks for registering. Use this code to finish setting up your account:</p>
          <div style="background:#f3f4f6; padding:20px; text-align:center; border-radius:8px; margin-bottom:16px">
            <div style="font-size:32px; letter-spacing:8px; font-weight:700; color:#2563eb;">${code}</div>
          </div>
          <p style="margin:0 0 16px; color:#4b5563">This code expires in 24 hours.</p>
          <a href="${config.FRONTEND_URL}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Open CargoLume</a>
        </div>
        <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
          <p style="margin:0 0 4px;">If you didn't create this account, you can safely ignore this email.</p>
          <p style="margin:0;">© ${new Date().getFullYear()} CargoLume. All rights reserved.</p>
        </div>
      </div>`;

    return this.sendEmail({
      to: email,
      subject: 'Verify your email for CargoLume',
      html
    });
  }

  async sendResendCodeEmail(email: string, code: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden">
        <div style="background:#1a2238; color:#fff; padding:16px 24px">
          <h1 style="margin:0; font-size:20px;">CargoLume</h1>
          <p style="margin:4px 0 0; font-size:12px; opacity:.9">Professional Load Board</p>
        </div>
        <div style="padding:24px">
          <h2 style="margin:0 0 8px; color:#111827; font-size:18px;">Verify your email</h2>
          <p style="margin:0 0 16px; color:#374151;">Here's your new verification code:</p>
          <div style="background:#f3f4f6; padding:20px; text-align:center; border-radius:8px; margin-bottom:16px">
            <div style="font-size:32px; letter-spacing:8px; font-weight:700; color:#2563eb;">${code}</div>
          </div>
          <p style="margin:0 0 16px; color:#4b5563">This code expires in 24 hours.</p>
          <a href="${config.FRONTEND_URL}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Open CargoLume</a>
        </div>
        <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
          <p style="margin:0 0 4px;">If you didn't request this code, you can safely ignore this email.</p>
          <p style="margin:0;">© ${new Date().getFullYear()} CargoLume. All rights reserved.</p>
        </div>
      </div>`;

    return this.sendEmail({
      to: email,
      subject: 'New verification code for CargoLume',
      html
    });
  }

  async sendEmail(message: { to: string; subject: string; html: string }): Promise<boolean> {
    if (!this.client || !this.sender) {
      logger.warn('Resend client not available - email not sent');
      return false;
    }

    try {
      const { data: responseData, error } = await this.client.emails.send({
        from: this.sender,
        to: message.to,
        subject: message.subject,
        html: message.html
      });

      if (error) {
        throw new Error(error.message ?? 'Unknown Resend error');
      }

      logger.info('Email sent successfully via Resend', {
        to: message.to,
        subject: message.subject,
        id: responseData?.id ?? null
      });
      return true;
    } catch (error: any) {
      logger.error('Resend email sending failed', {
        to: message.to,
        subject: message.subject,
        error: error?.message || error
      });
      return false;
    }
  }

  isConfigured(): boolean {
    return this.client !== null && !!this.sender;
  }

  async testConnection(): Promise<boolean> {
    return this.isConfigured();
  }
}

export const emailService = new EmailService();




