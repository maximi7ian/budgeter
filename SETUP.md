# Setup Guide

Complete setup instructions for installing and configuring Budgeter.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/budgeter.git
cd budgeter

# Install dependencies
npm install

# Test with dummy data (no configuration needed)
npm run dev
# Open http://localhost:3000
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following sections:

### 1. Basic Authentication (Required)

Protect your financial data with a password:

```env
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=random-string-for-encryption
```

**Important**: Use a strong password (8+ characters minimum).

### 2. TrueLayer Integration (Optional - For Real Bank Data)

**By default, the app runs in dummy mode** with fake data for testing. To connect real UK bank accounts:

1. Create an app at [TrueLayer Console](https://console.truelayer.com/)
2. Enable the **Data** product
3. Add redirect URI: `http://localhost:3000/callback`
4. Copy your credentials:

```env
MODE=live
TL_CLIENT_ID=your-truelayer-client-id
TL_CLIENT_SECRET=your-truelayer-client-secret
TL_REDIRECT_URI=http://localhost:3000/callback
```

**Note**: If `MODE` is not set or set to `dummy`, the app uses fake data and does not require TrueLayer credentials.

### 3. OpenAI API (Optional - AI Budget Summaries)

Get personalized financial advice powered by AI:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`:

```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-3.5-turbo
```

### 4. Email Configuration (Optional - Automated Alerts)

#### Option A: Gmail OAuth2 (Recommended)

More secure and better deliverability than SMTP:

1. Follow the detailed guide: [docs/setup-gmail-oauth.md](docs/setup-gmail-oauth.md)
2. Add to `.env`:

```env
GMAIL_USER=your@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=1//your-refresh-token
ALERT_EMAIL_TO=recipient@email.com
```

#### Option B: Basic SMTP

For Gmail with app password:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_FROM=your@gmail.com
ALERT_EMAIL_TO=recipient@email.com
```

For other providers:
- **Outlook**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **SendGrid**: `smtp.sendgrid.net`, port 587

### 5. Google Sheets (Optional - Excluded Expenses)

Track expenses that should be excluded from your budget:

1. Create a service account at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Download JSON key and save as `gcp-service-account.json` in project root
4. Create a spreadsheet with columns:
   ```
   Date | Vendor | Amount | Note
   ```
   (Date format: DD/MM/YYYY)
5. Share the sheet with the service account email (found in JSON file)
6. Add to `.env`:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SHEETS_RANGE=Excluded Expenses!A:D
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

**Note**: The spreadsheet ID is found in the URL: `https://docs.google.com/spreadsheets/d/{ID}/...`

### 6. AI Prompt Customization (Optional)

Customize how AI analyzes your spending:

1. Create `config/financial-advisor-prompt.txt`
2. Use these placeholders:
   - `{{totalSpend}}` - Regular spending total
   - `{{weeklyAllowance}}` - Budget target
   - `{{transactionCount}}` - Number of transactions
   - `{{largeTransactionLimit}}` - Large purchase threshold
   - `{{largePurchaseCount}}` - Excluded large purchases
   - `{{transactionsSummary}}` - Grouped transactions

## Environment Variables Reference

### Required (for Authentication)
- `ADMIN_EMAIL` - Login email
- `ADMIN_PASSWORD` - Login password (8+ characters)

### Optional - TrueLayer (Live Bank Data)
- `MODE` - `live` or `dummy` (default: `dummy`)
- `TL_CLIENT_ID` - TrueLayer client ID
- `TL_CLIENT_SECRET` - TrueLayer client secret
- `TL_REDIRECT_URI` - TrueLayer redirect URI (default: `http://localhost:3000/callback`)

### Optional - Budget Configuration
- `WEEKLY_ALLOWANCE` - Weekly spending budget (default: 100)
- `MONTHLY_ALLOWANCE` - Monthly spending budget (default: 4x weekly allowance)
- `LARGE_TRANSACTION_THRESHOLD` - Exclude purchases above this amount from regular budget (default: 100)
- `TL_EXCLUDE_ACCOUNTS` - Comma-separated list of account/card IDs to exclude from budget calculations

### Optional - AI & Email
- `SESSION_SECRET` - Session encryption key (auto-generated if not set)
- `OPENAI_API_KEY` - For AI budget summaries
- `OPENAI_MODEL` - OpenAI model (default: `gpt-3.5-turbo`)
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `GMAIL_USER` - Gmail address (for OAuth2)
- `GMAIL_CLIENT_ID` - Gmail OAuth2 client ID
- `GMAIL_CLIENT_SECRET` - Gmail OAuth2 client secret
- `GMAIL_REFRESH_TOKEN` - Gmail OAuth2 refresh token
- `MAIL_FROM` - Email sender address
- `ALERT_EMAIL_TO` - Email recipient address

### Optional - Google Sheets & Scheduling
- `GOOGLE_SHEETS_SPREADSHEET_ID` - Google Sheets ID
- `GOOGLE_SHEETS_RANGE` - Sheet range (e.g., `Sheet1!A:E`)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP service account JSON
- `WEEKLY_DAYS` - Days to fetch for weekly view (default: 7)
- `MONTHLY_MONTHS` - Months for monthly view (default: 1)
- `WEEKLY_CRON_SCHEDULE` - Weekly alert schedule (default: `0 9 * * 1` - Monday 9am)
- `MONTHLY_CRON_SCHEDULE` - Monthly alert schedule (default: `0 9 1 * *` - 1st of month 9am)

## First Run

1. Start the server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`

4. **If using live mode**: Click **"Connect Banks (TrueLayer)"** to authorize accounts

5. Visit **Settings** to check integration status:
   - OpenAI (AI Insights) - for spending analysis
   - Google Sheets - for excluded expenses
   - Email Service - for automated reports

**Note**: Budget settings (weekly allowance, large transaction threshold, etc.) are configured via environment variables in `.env`, not through the UI.

## Usage

### Viewing Transactions

- **Weekly**: Click "📅 Weekly" to fetch last 7 days
- **Monthly**: Click "📊 Monthly" to fetch previous month
- Download transactions as JSON for external analysis

### Testing Email Alerts

From the Settings page, you can manually send budget reports:
- **📅 Weekly Report** - Last 7 days
- **📊 Monthly Report** - Previous month
- **📋 Custom Report** - Opens a modal to select custom date range and budget

### Scheduled Alerts

Automated emails are sent based on your configuration:
- **Weekly**: Monday 9:00 AM (customizable via `WEEKLY_CRON_SCHEDULE`)
- **Monthly**: 1st of month 9:00 AM (customizable via `MONTHLY_CRON_SCHEDULE`)

Cron format: `minute hour day month weekday`

## Troubleshooting

### Authentication Issues

**"401 on token exchange"**
- Verify `TL_CLIENT_ID` and `TL_CLIENT_SECRET` in `.env`
- Check redirect URI matches exactly: `http://localhost:3000/callback`
- Update redirect URI in TrueLayer Console

**"Cannot access app"**
- Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set
- Password must be at least 8 characters

### Transaction Issues

**"No transactions found"**
- Adjust `WEEKLY_DAYS` to fetch more days (e.g., 14 or 30)
- Check date range in console logs

**"Transactions not showing"**
- Some providers may have delays in posting transactions
- Check both posted and pending transactions

### Google Sheets Issues

**"Permission denied (403)"**
- Share the sheet with your service account email
- Find email in `gcp-service-account.json` (`client_email` field)

**"Spreadsheet not found (404)"**
- Verify `GOOGLE_SHEETS_SPREADSHEET_ID` is correct
- Check sheet name matches `GOOGLE_SHEETS_RANGE`

### Email Issues

**"Failed to send email"**
- Verify SMTP settings match your provider
- For Gmail, use App Password (not regular password)
- Check firewall isn't blocking port 587

**For Gmail OAuth2 issues**, see [docs/setup-gmail-oauth.md](docs/setup-gmail-oauth.md)

### Scheduling Issues

**"Alerts not sending automatically"**
- Verify app is running continuously (not just on-demand)
- Check cron expressions using [crontab.guru](https://crontab.guru/)
- Verify timezone matches your location

## Security Best Practices

- Never commit `.env`, `gcp-service-account.json`, or `config.json`
- Use strong passwords (8+ characters, mixed case, numbers, symbols)
- Change `SESSION_SECRET` to a random string
- Use HTTPS in production (`NODE_ENV=production`)
- Tokens auto-refresh and are stored locally only

## What's Stored Locally

- OAuth tokens (`tokens/*.json`) - auto-refreshed
- User settings (`config.json`) - budget preferences
- Google service account key (`gcp-service-account.json`)

## What's NOT Stored

- No passwords in plain text
- No transaction history (fetched on-demand)
- No external database - everything is file-based

## Production Build

```bash
# Compile TypeScript
npm run build

# Set production environment
export NODE_ENV=production
export SESSION_SECRET=your-random-secret

# Run the compiled app
npm start
```

For cloud deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).
