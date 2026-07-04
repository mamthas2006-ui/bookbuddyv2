import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

/**
 * Reusable HTML Email Layout Template
 */
function renderEmailLayout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:'Inter',sans-serif;max-width:560px;margin:0 auto;background:#F8FAFC;padding:32px;border-radius:16px;color:#1E293B">
      <div style="background:#FFFFFF;padding:32px;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05)">
        <h2 style="color:#0F52BA;margin-top:0;font-size:24px;font-weight:700">${title}</h2>
        ${bodyHtml}
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0 16px" />
        <p style="color:#64748B;font-size:12px;margin:0">
          BookBuddy AI &bull; The intelligent reading companion
        </p>
      </div>
    </div>
  `;
}

async function send(to: string, subject: string, html: string) {
  if (!env.smtp.host || env.smtp.host.includes("mock") || env.smtp.host.includes("localhost")) {
    logger.info({ to, subject }, `[Email Mock] Would send email "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, html });
    logger.info({ to, subject }, `Email sent successfully to ${to}`);
  } catch (error) {
    logger.error({ error, to, subject }, "Failed to send email via SMTP");
  }
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  const html = renderEmailLayout(
    `Welcome to BookBuddy AI, ${name} 🌊`,
    `
      <p style="font-size:16px;line-height:1.6">Please confirm your email address to unlock your intelligent reading journey and AI recommendations.</p>
      <div style="margin:24px 0">
        <a href="${link}" style="display:inline-block;background:#0F52BA;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Verify Email Address</a>
      </div>
      <p style="color:#64748B;font-size:13px">If you didn't create an account with us, you can safely ignore this email.</p>
    `
  );
  await send(to, "Verify your BookBuddy AI account", html);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = `${env.clientUrl}/reset-password?token=${token}`;
  const html = renderEmailLayout(
    `Password Reset Request`,
    `
      <p style="font-size:16px;line-height:1.6">Hi ${name}, we received a request to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="margin:24px 0">
        <a href="${link}" style="display:inline-block;background:#0F52BA;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
      </div>
      <p style="color:#64748B;font-size:13px">If you didn't request a password reset, your account is safe and you can ignore this email.</p>
    `
  );
  await send(to, "Reset your BookBuddy AI password", html);
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = renderEmailLayout(
    `Your Reading Journey Begins! 📚`,
    `
      <p style="font-size:16px;line-height:1.6">Hi ${name}, we are thrilled to welcome you to BookBuddy AI!</p>
      <p style="font-size:15px;line-height:1.6">Here is how to get the most out of your new assistant:</p>
      <ul style="color:#334155;line-height:1.8;padding-left:20px">
        <li><strong>AI Discovery:</strong> Ask for books by mood, theme, or favorite movies.</li>
        <li><strong>Reader Personality:</strong> Take the onboarding quiz to get customized tips.</li>
        <li><strong>Gamified Goals:</strong> Build a daily reading habit and unlock XP badges.</li>
      </ul>
      <div style="margin:28px 0">
        <a href="${env.clientUrl}/dashboard" style="display:inline-block;background:#0F52BA;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Go to Dashboard</a>
      </div>
    `
  );
  await send(to, "Welcome to BookBuddy AI!", html);
}

