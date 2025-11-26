# Gmail OAuth2 Setup Guide

This guide walks you through setting up Gmail OAuth2 for sending budget emails from your own Gmail account. This is **more secure and reliable** than using app passwords, and emails are less likely to end up in spam.

## Why Use OAuth2 Instead of App Passwords?

✅ **Better Security**: No passwords stored, uses rotating tokens
✅ **Better Deliverability**: Emails sent from verified Gmail account
✅ **No Spam Filters**: Gmail recognizes emails as sent by you
✅ **Automatic Token Refresh**: Refresh tokens never expire

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown (top left) → **"NEW PROJECT"**
3. Project name: `Budgeter` (or any name you prefer)
4. Click **"CREATE"**
5. Wait for the project to be created (~30 seconds)
6. Select your new project from the dropdown

---

## Step 2: Enable Gmail API

1. In your Google Cloud project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"** in the results
4. Click the **"ENABLE"** button
5. Wait for it to enable (~10 seconds)

---

## Step 3: Create OAuth2 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (top of page) → **"OAuth client ID"**

3. **If prompted to configure OAuth consent screen:**
   - Click **"CONFIGURE CONSENT SCREEN"**
   - User Type: **"External"** (unless you have Google Workspace)
   - Click **"CREATE"**
   - Fill in required fields:
     - **App name**: `Budgeter`
     - **User support email**: Your Gmail address
     - **Developer contact**: Your Gmail address
   - Click **"SAVE AND CONTINUE"** (skip scopes)
   - Click **"SAVE AND CONTINUE"** (skip test users)
   - Click **"BACK TO DASHBOARD"**
   - Go back to **"Credentials"** tab

4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"** (again)

5. Configure OAuth client:
   - **Application type**: **"Desktop app"** (or "Web application" if you prefer)
   - **Name**: `Budgeter Email Sender`
   - Click **"CREATE"**

6. **Save your credentials:**
   - A popup will show your **Client ID** and **Client Secret**
   - Click **"DOWNLOAD JSON"** (optional, for backup)
   - **Copy and save these values** - you'll need them in Step 4

   Example:
   ```
   Client ID: 123456789-abc123.apps.googleusercontent.com
   Client Secret: GOCSPX-abcdefghijklmnop
   ```
7. **Enable OAuth2 Playground redirect URI**
   - Click the name of your OAuth 2.0 Client ID you created earlier (e.g., “Budgeter Email Sender”)
   - Scroll to "Authorized redirect URIs"
   - Add this exact URI `https://developers.google.com/oauthplayground`
   - Click save

8. **Add yourself as a Test user**
   - Navigate to `https://console.cloud.google.com/auth/audience`
   - Add yourself as a Test user
   
---

## Step 4: Get Refresh Token (OAuth2 Playground)

This is the most important step - you need a **refresh token** that allows the app to send emails on your behalf.

### Option A: Using OAuth2 Playground (Easier)

1. Go to [Google OAuth2 Playground](https://developers.google.com/oauthplayground/)

2. **Configure your credentials:**
   - Click the **gear icon** (⚙️) in the top right
   - Check ☑️ **"Use your own OAuth credentials"**
   - **OAuth Client ID**: Paste your Client ID from Step 3
   - **OAuth Client secret**: Paste your Client Secret from Step 3
   - Close the settings

3. **Authorize Gmail API:**
   - In the left panel (**Step 1**), scroll down to **"Gmail API v1"**
   - Expand it and select: **`https://mail.google.com/`**
   - Click **"Authorize APIs"** button

4. **Sign in with your Gmail account:**
   - Choose the Gmail account you want to send emails from
   - Click **"Continue"** when warned about unverified app
   - Click **"Continue"** again to grant permissions
   - You'll be redirected back to the playground

5. **Get the tokens:**
   - In **Step 2**, click **"Exchange authorization code for tokens"**
   - **Copy the "Refresh token"** - it starts with `1//`
   - Example: `1//0gHh3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Save this refresh token securely!**

---

## Step 5: Add Credentials to `.env`

Open your `.env` file and add these lines (replace with your actual values):

```env
# Gmail OAuth2 Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GMAIL_REFRESH_TOKEN=1//0gHh3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Recipients (who receives the budget emails)
ALERT_EMAIL_TO=recipient@email.com
```

**Important:**
- `GMAIL_USER` = The Gmail address you signed in with in Step 4
- Refresh tokens **never expire** as long as you don't revoke access
- Keep your `.env` file secure (it's already in `.gitignore`)

---

## Step 6: Test Email Sending

1. Restart your Budgeter app:
   ```bash
   npm run dev
   ```

2. Check the startup logs for:
   ```
   ✅ Email configured: Gmail OAuth2
   ```

3. Test sending an email:
   - Go to `http://localhost:3000/settings`
   - Click **"Send Weekly Summary Now"**
   - Check your inbox!

4. If it works, you'll see:
   ```
   ✅ Email sent successfully!
   Using Gmail OAuth2 authentication
   ```

---

## Troubleshooting

### "Error: invalid_grant" or "Token has been expired or revoked"

**Cause**: The refresh token is invalid or expired.

**Solution**:
1. Go back to OAuth2 Playground (Step 4)
2. Click **"Revoke token"** button (Step 3)
3. Start fresh from Step 4.3 (Authorize APIs)
4. Get a new refresh token

### "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured properly.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
3. Click **"PUBLISH APP"** (changes status from "Testing" to "In production")
4. Click **"CONFIRM"**

### Emails still going to spam

**Unlikely with OAuth2**, but if it happens:
1. Send a test email to yourself first
2. Mark it as "Not spam" in Gmail
3. Add `noreply@yourdomain.com` to your contacts

### "The caller does not have permission"

**Cause**: Gmail API not enabled.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Gmail API (Step 2)
3. Wait 1-2 minutes for it to propagate

---

## Security Notes

✅ **Safe to commit**: `.env` is in `.gitignore` - credentials won't be committed to Git
✅ **Rotating tokens**: Access tokens auto-refresh every hour
✅ **Revocable**: You can revoke access anytime in [Google Account Settings](https://myaccount.google.com/permissions)
✅ **Scoped**: Only has permission to send emails, not read them

---

## Alternative: Quick Setup Script (Advanced)

If you're comfortable with Node.js, you can use this script to automate token generation:

```javascript
// scripts/get-gmail-token.js
const readline = require('readline');
const {google} = require('googleapis');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://mail.google.com/'];
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Your refresh token:', token.refresh_token);
  });
});
```

Run with:
```bash
npm install googleapis
node scripts/get-gmail-token.js
```

---

## Summary

You now have:
- ✅ Gmail OAuth2 configured for secure email sending
- ✅ Emails sent from your verified Gmail account
- ✅ Better deliverability (won't go to spam)
- ✅ Automatic token refresh (no expiration)

**Next steps:**
- Update GCP VM deployment with OAuth2 credentials
- Test weekly/monthly email alerts
- Enjoy reliable budget notifications! 📧

---

## References

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Quickstart](https://developers.google.com/gmail/api/quickstart/nodejs)
- [Nodemailer OAuth2](https://nodemailer.com/smtp/oauth2/)
- [OAuth2 Playground](https://developers.google.com/oauthplayground/)
