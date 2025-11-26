# Budgeter

Personal finance dashboard with TrueLayer bank integration, AI-powered budget analysis, and automated email alerts. Track transactions, manage excluded expenses, and receive weekly/monthly budget summaries with personalized financial advice.

## Features

### Core Features
- 🏦 **Multi-Bank Integration**: Connect multiple UK bank accounts and cards (Monzo, Amex, Nationwide, etc.) via TrueLayer
- 📅 **Transaction Fetching**: Weekly (last 7 days) or Monthly (previous month) transaction views
- 📊 **Excluded Expenses Tracking**: Integrate with Google Sheets to track expenses that should be excluded from your budget (work reimbursements, gifts, etc.)
- 🎨 **Clean Web Interface**: Modern, intuitive dashboard for viewing transactions and account details
- 🧪 **Dummy Mode**: Test the app with fake data without connecting real accounts

### New Features
- 🔐 **Basic Authentication**: Password-protected access using environment variables
- ⚙️ **Settings Page**: Configure email alerts, budget parameters, and AI prompt templates
- 🤖 **AI-Powered Summaries**: OpenAI integration generates personalized budget analysis and savings tips
- 📧 **Email Alerts**: Automated weekly/monthly budget summaries sent to your inbox
- ⏰ **Scheduled Alerts**: Configurable cron-based scheduling for automatic emails
- 💰 **Smart Budget Calculations**: Automatically excludes large irregular purchases from budget analysis
- 📄 **JSON Export**: Download transaction data for further analysis

## Quick Start

```bash
# Install dependencies
npm install

# Test with dummy data (no setup required)
npm run dev
# Open http://localhost:3000

# Run with live data (after configuration)
MODE=live npm run dev
```

## Setup

### 1. Basic Authentication (Required)

Set up login credentials to protect your financial data:

```env
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=random-string-for-session-encryption
```

**Important**: Choose a strong password (8+ characters). The app will warn you on startup if authentication is not configured.

### 2. TrueLayer Integration (Required for Live Data)

1. Create an app at [TrueLayer Console](https://console.truelayer.com/)
2. Enable the **Data** product
3. Add redirect URI: `http://localhost:3000/callback`
4. Copy your credentials to `.env`:

```env
MODE=live
TL_CLIENT_ID=your-client-id
TL_CLIENT_SECRET=your-client-secret
```

### 3. OpenAI API (Optional - for AI Budget Summaries)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### 4. Email/SMTP Configuration (Optional - for Automated Alerts)

Configure email sending to receive automated budget emails. Choose one option:

#### Option 1: Gmail OAuth2 (Recommended - Better Security & Deliverability)

Gmail OAuth2 is more secure than app passwords and ensures emails don't go to spam:

1. Follow the detailed setup guide: **[scripts/setup-gmail-oauth.md](scripts/setup-gmail-oauth.md)**
2. Add OAuth2 credentials to `.env`:

```env
GMAIL_USER=your@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=1//your-refresh-token
ALERT_EMAIL_TO=recipient@email.com
```

**Benefits:**
- ✅ More secure (no passwords stored)
- ✅ Better deliverability (emails sent from verified Gmail account)
- ✅ Won't go to spam
- ✅ Automatic token refresh

#### Option 2: Basic SMTP (Fallback)

If you prefer traditional SMTP or use a non-Gmail provider:

**Gmail with App Password:**
1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_FROM=your@gmail.com
ALERT_EMAIL_TO=recipient@email.com
```

**Other Providers:**
- **Outlook/Office365**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **SendGrid**: `smtp.sendgrid.net`, port 587
- **Custom SMTP**: Use your provider's settings

### 5. Google Sheets (Optional - for Excluded Expenses)

Track expenses that should be excluded from your budget (work reimbursements, gifts, irregular purchases):

1. Create a service account at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Download JSON key → save as `gcp-service-account.json` in project root
4. Create a sheet with columns:
   ```
   Date | Vendor | Amount | Note | Repaid
   ```
   (Use DD/MM/YYYY for dates, TRUE/FALSE for Repaid)
5. Share the sheet with your service account email (found in the JSON file)
6. Add to `.env`:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your-sheet-id
GOOGLE_SHEETS_RANGE=Excluded Expenses!A:E
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

**Note**: The default sheet name is now "Excluded Expenses" (previously "Adsum Reimbursements"). Update your sheet name or change `GOOGLE_SHEETS_RANGE` accordingly.

## Usage

### First Time Setup

1. Start the server: `npm run dev`
2. Open http://localhost:3000
3. Log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`
4. Click **"Connect Banks (TrueLayer)"** to authorize your accounts
5. Visit **Settings** to configure budget alerts and preferences

### Viewing Transactions

- **Weekly**: Click "📅 Weekly" to fetch the last 7 days
- **Monthly**: Click "📊 Monthly" to fetch the previous month
- Transactions are displayed in a table with:
  - Posted/pending status
  - Merchant names
  - Amounts (color-coded: red for spending, green for credits)
  - Download JSON for external analysis

### Settings Configuration

Access **Settings** to configure:

#### Email Alert Settings
- **Alert Email Address**: Where to send budget summaries
- **Weekly Alerts**: Enable automated Monday morning summaries
- **Monthly Alerts**: Enable automated 1st-of-month summaries

#### Budget Settings
- **Weekly Allowance**: Your target weekly spending (default: £100)
- **Large Transaction Threshold**: Purchases above this amount are excluded from regular budget calculations (default: £100)
  - Example: If set to £100, holiday flights costing £500 won't affect your "on budget" analysis

#### AI Prompt Template
Customize how the AI analyzes your spending. Available placeholders:
- `{{totalSpend}}` - Regular spending total (excluding large purchases)
- `{{weeklyAllowance}}` - Your weekly budget target
- `{{transactionCount}}` - Number of transactions
- `{{largeTransactionLimit}}` - Your large purchase threshold
- `{{largePurchaseCount}}` - Number of large purchases excluded
- `{{transactionsSummary}}` - Grouped transactions by merchant

### Manual Email Testing

From the Settings page, click **"Send Weekly/Monthly Summary Now"** to test email alerts immediately without waiting for the schedule.

### Scheduled Alerts

Automated emails are sent based on your Settings configuration:
- **Weekly**: Default Monday 9:00 AM (customizable via `WEEKLY_CRON_SCHEDULE`)
- **Monthly**: Default 1st of month 9:00 AM (customizable via `MONTHLY_CRON_SCHEDULE`)

Cron format: `minute hour day month weekday`
- Example: `0 9 * * 1` = Every Monday at 9:00 AM
- Example: `0 9 1 * *` = 1st of every month at 9:00 AM

## Environment Variables

See [.env.example](.env.example) for all available options. Key variables:

### Required (Live Mode)
- `MODE` - `live` or `dummy`
- `TL_CLIENT_ID` - TrueLayer client ID
- `TL_CLIENT_SECRET` - TrueLayer client secret
- `ADMIN_EMAIL` - Login email
- `ADMIN_PASSWORD` - Login password

### Optional
- `OPENAI_API_KEY` - For AI budget summaries
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email alerts
- `GOOGLE_SHEETS_SPREADSHEET_ID` - For excluded expenses tracking
- `WEEKLY_DAYS` - Days to fetch for weekly view (default: 7)
- `MONTHLY_MONTHS` - Months to fetch for monthly view (default: 1)
- `SESSION_SECRET` - Encryption key for sessions
- `WEEKLY_CRON_SCHEDULE` - Custom weekly alert schedule
- `MONTHLY_CRON_SCHEDULE` - Custom monthly alert schedule

## Project Structure

```
src/
├── server.ts          # Express app + routes + authentication
├── truelayer.ts       # OAuth + token management
├── data.ts            # Fetch accounts & transactions
├── sheets.ts          # Google Sheets integration (excluded expenses)
├── ui.ts              # HTML renderers (home, transactions, settings, login)
├── auth.ts            # Authentication middleware
├── config.ts          # Settings storage (config.json)
├── email.ts           # Email sending (Nodemailer)
├── ai.ts              # OpenAI integration
├── scheduler.ts       # Cron job scheduling
├── alertService.ts    # Budget alert orchestration
└── types.ts           # TypeScript definitions
```

## Scripts

```bash
npm run dev    # Development mode with auto-reload
npm run build  # Compile TypeScript to JavaScript
npm start      # Production mode (requires npm run build first)
```

## Troubleshooting

### Authentication Issues

**"401 on token exchange"**
- Verify `TL_CLIENT_ID` and `TL_CLIENT_SECRET` in .env
- Check redirect URI matches exactly: `http://localhost:3000/callback`

**"Cannot access app"**
- Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in .env
- Password must be at least 8 characters

### Transaction Issues

**"No transactions found"**
- Adjust `WEEKLY_DAYS` to fetch more days (e.g., 14 or 30)
- Check date range in console logs - ensure it covers the period you expect

**"Transactions not showing"**
- Some providers may have delays in posting transactions
- Check both posted and pending transactions in the UI

### Google Sheets Issues

**"Permission denied (403)"**
- Share the sheet with your service account email
- Find the email in `gcp-service-account.json` (look for `client_email` field)

**"Spreadsheet not found (404)"**
- Check `GOOGLE_SHEETS_SPREADSHEET_ID` is correct
- The ID is in the sheet URL: `https://docs.google.com/spreadsheets/d/{ID}/...`

**"Failed to fetch excluded expenses"**
- Ensure sheet name matches `GOOGLE_SHEETS_RANGE` (default: "Excluded Expenses!A:E")
- Verify columns are: Date | Vendor | Amount | Note | Repaid
- App continues without sheets data if unavailable

### Email Issues

**"Failed to send email"**
- Verify SMTP settings match your provider
- For Gmail, use an App Password, not your regular password
- Check firewall/antivirus isn't blocking port 587

**"OpenAI API error"**
- Verify `OPENAI_API_KEY` is correct
- Check you have available credits on your OpenAI account
- Ensure API key has not expired

### Scheduling Issues

**"Alerts not sending automatically"**
- Check the app is running continuously (not just on-demand)
- For cloud deployments (Cloud Run, etc.), use Cloud Scheduler to trigger the app
- Verify cron expressions are valid: use [crontab.guru](https://crontab.guru/) to test

## Security

### Best Practices
- ✅ Never commit `.env`, `gcp-service-account.json`, or `config.json`
- ✅ All sensitive files are in `.gitignore`
- ✅ Use strong passwords (8+ characters, mixed case, numbers, symbols)
- ✅ Tokens auto-refresh and are stored locally only
- ✅ Use HTTPS in production (`NODE_ENV=production`)
- ✅ Change `SESSION_SECRET` to a random string

### What's Stored Locally
- OAuth tokens (`tokens/*.json`) - encrypted, auto-refreshed
- User settings (`config.json`) - budget preferences, alert email
- Google service account key (`gcp-service-account.json`)

### What's NOT Stored
- No passwords in plain text (bcrypt-ready)
- No transaction history (fetched on-demand)
- No external database - everything is file-based

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. Set production environment variables:
   ```bash
   export NODE_ENV=production
   export SESSION_SECRET=your-random-secret
   # ... other vars
   ```

3. Run the server:
   ```bash
   npm start
   ```

### Cloud Deployment Notes

**Google Cloud Run / AWS Lambda / Azure Functions**:
- For serverless platforms, use an external cron service (e.g., Cloud Scheduler) to hit `/send-alert/weekly` and `/send-alert/monthly` endpoints
- Ensure persistent storage for `tokens/` and `config.json` (use volumes or cloud storage)

**Always-On Servers (VPS, EC2, etc.)**:
- Built-in cron scheduler works out of the box
- Use a process manager like PM2 to keep the app running:
  ```bash
  npm install -g pm2
  pm2 start dist/server.js --name budgeter
  pm2 save
  ```

## License

MIT
