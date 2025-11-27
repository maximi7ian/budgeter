# Budgeter

A personal finance dashboard that connects to your UK bank accounts, tracks spending, and sends automated weekly/monthly budget summaries with AI-powered financial advice.

## What It Does

- **Multi-Bank Integration**: Connect multiple UK bank accounts and cards (Monzo, Amex, Nationwide, etc.) via TrueLayer
- **Transaction Tracking**: View weekly (last 7 days) or monthly (previous month) transactions
- **Smart Budget Analysis**: Automatically excludes large irregular purchases from budget calculations
- **Excluded Expenses**: Track expenses that should be excluded via Google Sheets (work reimbursements, gifts, etc.)
- **AI-Powered Insights**: OpenAI generates personalized spending analysis and savings tips
- **Automated Email Alerts**: Scheduled weekly/monthly budget summaries sent to your inbox
- **Clean Web Interface**: Modern dashboard for viewing transactions and managing settings

## Key Features

- Password-protected access
- Dummy mode for testing without real bank connections
- Configurable budget parameters and alert schedules
- JSON export for transaction data
- Automatic OAuth token management

## Quick Start

```bash
# Test with dummy data (no configuration needed)
npm install
npm run dev
# Open http://localhost:3000

# Run with live bank data (after setup)
MODE=live npm run dev
```

## Documentation

- **[SETUP.md](SETUP.md)** - Installation, configuration, and environment variables
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploying to Google Cloud Platform
- **[docs/setup-gmail-oauth.md](docs/setup-gmail-oauth.md)** - Gmail OAuth2 configuration for email alerts

## Project Structure

```
budgeter/
├── src/               # TypeScript source code
│   ├── server.ts      # Express app and routes
│   ├── truelayer.ts   # TrueLayer OAuth integration
│   ├── data.ts        # Transaction fetching logic
│   ├── email/         # Email templating and AI advice
│   └── ui/            # HTML rendering
├── config/            # User configuration (gitignored)
├── docs/              # Additional documentation
├── scripts/           # Test and utility scripts
└── dist/              # Compiled JavaScript (generated)
```

## Requirements

- Node.js 18+ (Node 20 recommended)
- TrueLayer developer account (for live bank connections)
- Optional: OpenAI API key (for AI summaries)
- Optional: Gmail/SMTP (for email alerts)
- Optional: Google Cloud service account (for excluded expenses tracking)

## Development

```bash
npm run dev    # Development mode with auto-reload
npm run build  # Compile TypeScript
npm start      # Production mode
```

## Security

- All sensitive files are in `.gitignore`
- Password-protected web interface
- OAuth tokens stored locally with automatic refresh
- HTTPS enforced in production

## License

MIT
