import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let transporter = null;
let currentConfig = null;

/**
 * Get current SMTP status without leaking sensitive passwords
 */
export const getSmtpStatus = () => {
  const isGmail = process.env.SMTP_SERVICE === 'gmail' || process.env.SMTP_HOST?.includes('gmail');
  const hasCreds = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  let maskedUser = '';
  if (process.env.SMTP_USER) {
    const parts = process.env.SMTP_USER.split('@');
    if (parts.length === 2) {
      const u = parts[0];
      maskedUser = (u.length > 3 ? u.substring(0, 2) + '***' + u.slice(-1) : u + '***') + '@' + parts[1];
    } else {
      maskedUser = '***';
    }
  }

  return {
    configured: hasCreds,
    provider: hasCreds ? (isGmail ? 'Gmail SMTP' : (process.env.SMTP_HOST || 'Custom SMTP')) : 'Ethereal Test Sandbox',
    user: maskedUser,
    isRealDelivery: hasCreds
  };
};

/**
 * Reset and reload transporter (e.g. after updating SMTP credentials)
 */
export const reloadEmailTransporter = () => {
  transporter = null;
  currentConfig = null;
};

/**
 * Update SMTP credentials in runtime and persist to server/.env
 */
export const updateSmtpConfig = async ({ service, host, port, secure, user, pass, fromEmail }) => {
  // Update process.env in memory
  if (service === 'gmail') {
    process.env.SMTP_SERVICE = 'gmail';
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
  } else if (host) {
    delete process.env.SMTP_SERVICE;
    process.env.SMTP_HOST = host;
    process.env.SMTP_PORT = String(port || 587);
    process.env.SMTP_SECURE = String(secure === true || secure === 'true');
  }

  if (user) process.env.SMTP_USER = user.trim();
  if (pass) process.env.SMTP_PASS = pass.trim().replace(/\s+/g, ''); // strip spaces from App Passwords
  if (fromEmail || user) process.env.EMAIL_FROM = (fromEmail || user).trim();

  // Test create transporter and verify
  let testTransport;
  if (process.env.SMTP_SERVICE === 'gmail') {
    testTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    testTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Verify connection with SMTP server
  await testTransport.verify();

  // Persist to .env file
  let envLines = [];
  if (fs.existsSync(envPath)) {
    const existing = fs.readFileSync(envPath, 'utf8');
    envLines = existing.split('\n').filter(l => {
      const trimmed = l.trim();
      return !trimmed.startsWith('SMTP_') && !trimmed.startsWith('EMAIL_FROM');
    });
  }

  envLines.push(`SMTP_SERVICE=${process.env.SMTP_SERVICE || ''}`);
  envLines.push(`SMTP_HOST=${process.env.SMTP_HOST || ''}`);
  envLines.push(`SMTP_PORT=${process.env.SMTP_PORT || '587'}`);
  envLines.push(`SMTP_SECURE=${process.env.SMTP_SECURE || 'false'}`);
  envLines.push(`SMTP_USER=${process.env.SMTP_USER || ''}`);
  envLines.push(`SMTP_PASS=${process.env.SMTP_PASS || ''}`);
  envLines.push(`EMAIL_FROM=${process.env.EMAIL_FROM || ''}`);

  fs.writeFileSync(envPath, envLines.join('\n'), 'utf8');

  // Set active transporter
  transporter = testTransport;
  currentConfig = { user: process.env.SMTP_USER };

  return getSmtpStatus();
};

/**
 * Initialize mail transporter with SMTP config or automatic Ethereal test account
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  // 1. If user provided Gmail configuration
  if (process.env.SMTP_SERVICE === 'gmail' && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log(`[Email Service]: Configured Gmail SMTP transporter for ${process.env.SMTP_USER}`);
      return transporter;
    } catch (err) {
      console.error('[Email Service Error]: Gmail transport init failed:', err.message);
    }
  }

  // 2. If user provided custom SMTP credentials in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log(`[Email Service]: Configured custom SMTP transporter for ${process.env.SMTP_HOST}`);
      return transporter;
    } catch (err) {
      console.error('[Email Service Error]: Custom SMTP init failed:', err.message);
    }
  }

  // 3. Fallback: Create real Ethereal SMTP test transporter so emails are genuinely sent to test server
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[Email Service]: Initialized automated SMTP email service (Ethereal: ${testAccount.user})`);
    return transporter;
  } catch (err) {
    console.error('[Email Service Error]: Failed to create test SMTP transporter, using JSON transporter fallback', err.message);
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return transporter;
  }
};

/**
 * Send OTP Verification Email to recipient
 * @param {string} toEmail 
 * @param {string} otpCode 
 */
export const sendOtpEmail = async (toEmail, otpCode) => {
  const mailer = await getTransporter();

  const isRealSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Go Creators Cinema Net" <no-reply@gocreators.io>';

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `Your Go Creators Verification Code: ${otpCode}`,
    text: `Welcome to Go Creators!\n\nYour 6-digit email verification code is: ${otpCode}\n\nThis OTP is valid for 10 minutes. To protect your identity and avoid fake account registrations, please enter this code on the registration page.\n\nIf you did not request this code, you can safely ignore this email.\n\n- The Go Creators Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">GO<span style="color: #38bdf8;">CREATORS</span></h1>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">CINEMA & SHORT-FORM TALENT NETWORKING PLATFORM</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Verify Your Creator Email</h2>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
            To ensure community safety and prevent fake account entries, please verify your email address. Use the 6-digit verification code below to complete your registration:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #f8fafc; border: 2px dashed #2563eb; border-radius: 12px; padding: 16px 36px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">${otpCode}</span>
            </div>
          </div>
          <p style="margin: 20px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
            ⏱️ This code expires in <strong>10 minutes</strong>. Never share this code with anyone.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} Go Creators Platform. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    
    let testUrl = null;
    try {
      testUrl = nodemailer.getTestMessageUrl(info);
    } catch {
      testUrl = null;
    }

    console.log(`\n========================================`);
    console.log(`📧 [EMAIL SENT SUCCESSFULLY]`);
    console.log(`   To: ${toEmail}`);
    console.log(`   Mode: ${isRealSmtp ? 'REAL SMTP INBOX DELIVERY' : 'ETHEREAL TEST MAILBOX'}`);
    console.log(`   Message ID: ${info.messageId}`);
    if (testUrl) {
      console.log(`   View Live Sent Email in Web Browser: ${testUrl}`);
    }
    console.log(`========================================\n`);

    return {
      success: true,
      messageId: info.messageId,
      deliveryMode: isRealSmtp ? 'smtp_live' : 'ethereal_test',
      testUrl: testUrl || null,
      otpCode: !isRealSmtp ? otpCode : null // only exposed in dev/ethereal mode to ensure testability
    };
  } catch (error) {
    console.error('[Email Dispatch Error]:', error);
    throw error;
  }
};
