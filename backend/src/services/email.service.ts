import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const user = config.EMAIL_USER;
    const pass = config.EMAIL_PASS;

    logger.info('Email configuration check', { userSet: !!user, passSet: !!pass });

    if (!user || !pass) {
      logger.warn('EMAIL_USER or EMAIL_PASS environment variables are missing. Email notifications are disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateDelta: 20000,
      rateLimit: 5
    });

    logger.info('Email transporter created successfully');
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not available - email not sent');
      return false;
    }

    try {
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

      await this.transporter.sendMail({
        from: `"CargoLume" <${config.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email for CargoLume',
        html
      });

      logger.info('Verification email sent successfully', { email });
      return true;
    } catch (error: any) {
      logger.error('Email sending failed', { email, error: error.message });
      return false;
    }
  }

  async sendResendCodeEmail(email: string, code: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not available - email not sent');
      return false;
    }

    try {
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

      await this.transporter.sendMail({
        from: `"CargoLume" <${config.EMAIL_USER}>`,
        to: email,
        subject: 'New verification code for CargoLume',
        html
      });

      logger.info('Resend code email sent successfully', { email });
      return true;
    } catch (error: any) {
      logger.error('Email sending failed', { email, error: error.message });
      return false;
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }
}

export const emailService = new EmailService();




