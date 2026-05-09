import nodemailer from 'nodemailer';
import { env, hasEmailConfig, isDevMode } from '../config/env';

function createTransport() {
  if (!hasEmailConfig) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
}

const transporter = createTransport();

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${env.CLIENT_URL}/auth/verify-email?token=${token}`;

  // Dev fallback: log to console when SMTP is not configured
  if (!transporter) {
    console.log('\n─────────────────────────────────────────────');
    console.log('[Email] DEV MODE — Verification link:');
    console.log(`  ${verifyUrl}`);
    console.log('─────────────────────────────────────────────\n');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #5B4FE8;">Verify your email</h2>
      <p>Thanks for signing up! Click the button below to verify your email address.</p>
      <a
        href="${verifyUrl}"
        style="
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background-color: #5B4FE8;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        "
      >
        Verify Email
      </a>
      <p style="margin-top: 24px; color: #888; font-size: 13px;">
        Or paste this link in your browser:<br />
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
      <p style="color: #888; font-size: 12px;">If you didn't sign up, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Smart Tracker" <${env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email — Smart Task & Habit Tracker',
    html,
  });

  if (isDevMode) {
    console.log(`[Email] Verification email sent to ${to}`);
  }
}
