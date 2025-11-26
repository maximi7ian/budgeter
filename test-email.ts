/**
 * Test email sending functionality
 */

import "dotenv/config";
import { verifyEmailConnection, sendBudgetEmail, isEmailConfigured, getEmailRecipients } from "./src/email";

async function testEmail() {
  console.log("\n=".repeat(60));
  console.log("📧 EMAIL CONFIGURATION TEST");
  console.log("=".repeat(60));

  // Step 1: Check configuration
  console.log("\n1️⃣ Checking email configuration...");
  console.log(`   GMAIL_USER: ${process.env.GMAIL_USER || 'NOT SET'}`);
  console.log(`   GMAIL_CLIENT_ID: ${process.env.GMAIL_CLIENT_ID ? 'SET' : 'NOT SET'}`);
  console.log(`   GMAIL_CLIENT_SECRET: ${process.env.GMAIL_CLIENT_SECRET ? 'SET' : 'NOT SET'}`);
  console.log(`   GMAIL_REFRESH_TOKEN: ${process.env.GMAIL_REFRESH_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`   ALERT_EMAIL_TO: ${process.env.ALERT_EMAIL_TO || 'NOT SET'}`);

  const configured = isEmailConfigured();
  console.log(`\n   Email configured: ${configured ? '✅ YES' : '❌ NO'}`);

  if (!configured) {
    console.log("\n❌ Email is not configured. Please set Gmail OAuth2 credentials in .env");
    process.exit(1);
  }

  const recipient = getEmailRecipients();
  console.log(`   Recipients: ${recipient || 'NOT SET'}`);

  // Step 2: Verify connection
  console.log("\n2️⃣ Verifying SMTP connection...");
  const verified = await verifyEmailConnection();

  if (!verified) {
    console.log("\n❌ SMTP connection failed. Check your credentials.");
    process.exit(1);
  }

  // Step 3: Send test email
  console.log("\n3️⃣ Sending test email...");
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-top: 0;">✅ Test Email Successful</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            This is a test email from your Budgeter application. If you're seeing this, your email configuration is working correctly!
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            <strong>Configuration details:</strong>
          </p>
          <ul style="color: #666; font-size: 14px;">
            <li>Gmail User: ${process.env.GMAIL_USER}</li>
            <li>Using Gmail OAuth2 authentication</li>
            <li>Sent at: ${new Date().toLocaleString()}</li>
          </ul>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            Sent by Budgeter - Personal Finance Tracker
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendBudgetEmail(
      "🧪 Test Email from Budgeter",
      testHtml
    );
    console.log("\n✅ Test email sent successfully!");
    console.log("=".repeat(60));
  } catch (error: any) {
    console.log("\n❌ Failed to send test email");
    console.log(`   Error: ${error.message}`);
    console.log("\n" + "=".repeat(60));
    process.exit(1);
  }
}

testEmail().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
