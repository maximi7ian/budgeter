/**
 * Email sending functionality using Nodemailer with Gmail OAuth2
 */

import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

/**
 * Check if email is configured (supports both OAuth2 and basic auth)
 */
export function isEmailConfigured(): boolean {
  // Option 1: Gmail OAuth2 (recommended)
  const hasOAuth = !!(
    process.env.GMAIL_USER &&
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );

  // Option 2: Basic SMTP (fallback for non-Gmail or legacy setup)
  const hasBasicAuth = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  return hasOAuth || hasBasicAuth;
}

/**
 * Get email recipients (prioritize env, can be comma-separated list)
 * Returns comma-separated string of email addresses
 */
export function getEmailRecipients(): string | undefined {
  // Get from environment variable (can be comma-separated)
  const envEmails = process.env.ALERT_EMAIL_TO;

  if (!envEmails) {
    return undefined;
  }

  // Return as-is (will be used in email "to" field, supports comma-separated)
  return envEmails.trim();
}

/**
 * Get email recipients as array
 */
export function getEmailRecipientsArray(): string[] {
  const recipients = getEmailRecipients();

  if (!recipients) {
    return [];
  }

  // Split by comma and trim whitespace
  return recipients
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Validate email configuration before sending
 */
export function validateEmailSetup(): { valid: boolean; error?: string } {
  // Check email configuration
  if (!isEmailConfigured()) {
    return {
      valid: false,
      error: "Email not configured. Set either Gmail OAuth2 (GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN) or basic SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) in .env",
    };
  }

  // Check recipient
  const recipients = getEmailRecipients();
  if (!recipients) {
    return {
      valid: false,
      error: "No recipient email configured. Set ALERT_EMAIL_TO in .env (can be comma-separated list)",
    };
  }

  return { valid: true };
}

/**
 * Create nodemailer transporter (supports Gmail OAuth2 and basic SMTP)
 */
function createTransporter(): Mail {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email not configured. Set either Gmail OAuth2 or basic SMTP credentials in .env"
    );
  }

  // Option 1: Gmail OAuth2 (recommended for Gmail accounts)
  const hasOAuth = !!(
    process.env.GMAIL_USER &&
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );

  if (hasOAuth) {
    console.log("   Using Gmail OAuth2 authentication");
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        // accessToken is optional - will be generated from refresh token if not provided
        ...(process.env.GMAIL_ACCESS_TOKEN && { accessToken: process.env.GMAIL_ACCESS_TOKEN }),
      },
    });
  }

  // Option 2: Basic SMTP (fallback)
  console.log("   Using basic SMTP authentication");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send budget alert email
 */
export async function sendBudgetEmail(
  subject: string,
  htmlContent: string,
  recipient?: string
): Promise<void> {
  // Step 1: Check what email addresses to use
  // Priority: 1. Explicit recipient parameter, 2. Environment variable (comma-separated)
  const to = recipient || getEmailRecipients();

  console.log("📧 Email sending process:");
  console.log(`   Step 1: Checking recipient address(es)...`);

  if (!to) {
    const errorMsg = "No email recipients configured. Please set ALERT_EMAIL_TO in .env (can be comma-separated list)";
    console.error(`   ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const recipientArray = to.split(',').map(e => e.trim()).filter(e => e);
  console.log(`   ✓ Recipients (${recipientArray.length}): ${recipientArray.join(', ')}`);
  console.log(`   Step 2: Validating SMTP configuration...`);

  if (!isEmailConfigured()) {
    const errorMsg = "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env";
    console.error(`   ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  console.log(`   ✓ SMTP configured: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`   Step 3: Creating email transporter...`);

  const transporter = createTransporter();

  console.log(`   ✓ Transporter created`);
  console.log(`   Step 4: Preparing email message...`);

  // Determine sender email (use Gmail user if OAuth is configured, otherwise MAIL_FROM)
  const fromEmail = process.env.GMAIL_USER || process.env.MAIL_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"Budgeter" <${fromEmail}>`,
    to,
    subject,
    html: htmlContent,
  };

  console.log(`   ✓ Subject: ${subject}`);
  console.log(`   Step 5: Sending email...`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`   ✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
  } catch (error: any) {
    console.error(`   ❌ Failed to send email: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ SMTP connection verified");
    return true;
  } catch (error: any) {
    console.error("❌ SMTP connection failed:", error.message);
    return false;
  }
}
