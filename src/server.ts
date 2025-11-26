/**
 * Express server for TrueLayer transaction aggregator
 * Routes: /, /link, /callback, /transactions, /login, /settings
 */

import "dotenv/config";
import express, { Request, Response } from "express";
import session from "express-session";
import { generateAuthLink, exchangeCodeForToken } from "./truelayer";
import { getDummyData, listAllConnectedItemsFromAllTokens, listAllTransactionsFromAllTokens, calculateDateWindow, getAllConnections, disconnectConnection } from "./data";
import { renderHomePage, renderErrorPage, renderLoginPage, renderSettingsPage, renderEnhancedTransactionsPage } from "./ui";
import { WindowMode } from "./types";
import { generateTokenFilename, saveToken, listTokenFiles } from "./tokenStore";
import { isAuthEnabled, verifyCredentials, requireAuth, redirectIfAuthenticated } from "./auth";
import { startScheduler } from "./scheduler";
import { sendBudgetAlertForPeriod } from "./alertService";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "budgeter-secret-change-me-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Environment configuration
const CLIENT_ID = process.env.TL_CLIENT_ID!;
const CLIENT_SECRET = process.env.TL_CLIENT_SECRET!;
const REDIRECT_URI = process.env.TL_REDIRECT_URI || `http://localhost:${PORT}/callback`;
const AUTH_BASE = process.env.TL_AUTH_BASE || "https://auth.truelayer.com";
const TOKEN_URL = process.env.TL_TOKEN_URL || "https://auth.truelayer.com/connect/token";
const API_BASE = process.env.TL_API_BASE || "https://api.truelayer.com";
const SCOPES =
  process.env.TL_SCOPES || "accounts cards transactions balance offline_access";
// IMPORTANT: We omit the 'providers' parameter entirely to allow both bank accounts AND card providers
// American Express is a card provider; filtering with "uk-ob-all" or similar can exclude cards
// By not setting providers at all, TrueLayer shows all available providers including Amex cards
const PROVIDERS = process.env.TL_PROVIDERS || undefined; // undefined = omit parameter
const MODE = process.env.MODE || "live"; // live or dummy

// Validate required env vars
if (MODE === "live" && (!CLIENT_ID || !CLIENT_SECRET)) {
  console.error("❌ Error: TL_CLIENT_ID and TL_CLIENT_SECRET must be set in .env");
  console.log("💡 Tip: Set MODE=dummy to run in dummy mode without credentials");
  process.exit(1);
}

// Check authentication configuration on startup
if (isAuthEnabled()) {
  console.log("🔐 Authentication enabled");
  console.log(`   Admin email: ${process.env.ADMIN_EMAIL}`);
} else {
  console.warn("⚠️  Authentication NOT configured - app is publicly accessible!");
  console.warn("   Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to secure the app");
}

/**
 * GET /login - Login page
 */
app.get("/login", redirectIfAuthenticated, (req: Request, res: Response) => {
  res.send(renderLoginPage());
});

/**
 * POST /login - Handle login
 */
app.post("/login", redirectIfAuthenticated, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send(renderLoginPage("Email and password are required"));
  }

  const isValid = await verifyCredentials(email, password);

  if (isValid) {
    // Set session
    (req.session as any).userId = email;
    res.redirect("/");
  } else {
    res.send(renderLoginPage("Invalid email or password"));
  }
});

/**
 * GET /logout - Logout
 */
app.get("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
});

/**
 * GET /settings - Settings page (read-only, all settings from environment)
 */
app.get("/settings", requireAuth, (req: Request, res: Response) => {
  res.send(renderSettingsPage());
});

/**
 * POST /send-alert/:period - Manually trigger alert email
 */
app.post("/send-alert/:period", requireAuth, async (req: Request, res: Response) => {
  const { period } = req.params;

  if (period !== "weekly" && period !== "monthly") {
    return res.send(renderErrorPage("Invalid Period", 'Period must be "weekly" or "monthly"'));
  }

  try {
    await sendBudgetAlertForPeriod(period as WindowMode);
    res.send(
      renderSettingsPage(
        `${period === "weekly" ? "Weekly" : "Monthly"} budget alert sent successfully!`
      )
    );
  } catch (error: any) {
    res.send(
      renderSettingsPage(
        undefined,
        `Failed to send alert: ${error.message}`
      )
    );
  }
});

/**
 * GET / - Home page
 * Shows connected accounts if authenticated
 */
app.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    if (MODE === "dummy") {
      // Dummy mode - show fake accounts
      const dummyAccounts = getDummyData("weekly").accounts;
      return res.send(renderHomePage(dummyAccounts, undefined, []));
    }

    // Check if any tokens exist
    const tokenFiles = await listTokenFiles();
    if (tokenFiles.length === 0) {
      return res.send(renderHomePage(null, undefined, []));
    }

    // Get all connections with their token file mappings
    const connections = await getAllConnections(CLIENT_ID, CLIENT_SECRET, TOKEN_URL, API_BASE);

    // Flatten items for display
    const allItems = connections.flatMap((c) => c.items);

    // Convert to account summaries
    const accountSummaries = allItems.map((item) => ({
      kind: item.kind,
      id: item.kind === "account" ? item.account_id : item.card_id,
      provider: item.provider,
      type: item.kind === "account" ? item.account_type : item.card_type,
      display_name: item.display_name,
      currency: item.currency,
    }));

    res.send(renderHomePage(accountSummaries, undefined, connections));
  } catch (error: any) {
    console.error("Error on home page:", error);
    res.send(renderHomePage(null, error.message, []));
  }
});

/**
 * GET /link - Generate OAuth link and redirect
 */
app.get("/link", requireAuth, (req: Request, res: Response) => {
  if (MODE === "dummy") {
    return res.send(
      renderErrorPage(
        "Dummy Mode Active",
        "OAuth is disabled in dummy mode. Set MODE=live in .env to use real accounts."
      )
    );
  }

  const authUrl = generateAuthLink(CLIENT_ID, REDIRECT_URI, SCOPES, AUTH_BASE, PROVIDERS);
  console.log("🔗 Redirecting to TrueLayer auth");
  console.log("   Scopes:", SCOPES);
  console.log("   Providers param:", PROVIDERS || "(omitted - allows all providers including cards)");
  console.log("   URL:", authUrl);
  res.redirect(authUrl);
});

/**
 * GET /callback - OAuth callback
 * Exchange code for tokens
 */
app.get("/callback", requireAuth, async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error("❌ OAuth error:", error, error_description);
    return res.send(
      renderErrorPage("Authentication Error", `${error}: ${error_description || "Unknown error"}`)
    );
  }

  if (!code) {
    return res.send(renderErrorPage("No Authorization Code", "No code received from TrueLayer"));
  }

  try {
    console.log("🔄 Exchanging code for token...");
    const tokenData = await exchangeCodeForToken(
      code as string,
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI,
      TOKEN_URL
    );

    // Generate new token filename (doesn't overwrite existing)
    const tokenFile = generateTokenFilename();

    // Convert TokenData to Tokens format and add scope
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      scope: SCOPES,
      token_type: tokenData.token_type,
    };

    await saveToken(tokenFile, tokens);
    console.log(`✅ Token saved to: ${tokenFile}`);

    // Redirect to home
    res.redirect("/");
  } catch (error: any) {
    console.error("❌ Token exchange failed:", error);
    res.send(renderErrorPage("Token Exchange Failed", error.message));
  }
});

/**
 * GET /transactions?window=weekly|monthly
 * Fetch transactions for the specified window
 */
app.get("/transactions", requireAuth, async (req: Request, res: Response) => {
  try {
    const window = (req.query.window as WindowMode) || "weekly";

    if (window !== "weekly" && window !== "monthly") {
      return res.send(
        renderErrorPage("Invalid Window", 'Window must be "weekly" or "monthly"')
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 Fetching ${window} transactions`);
    console.log("=".repeat(60));

    let output;

    if (MODE === "dummy") {
      console.log("📦 Using dummy data (MODE=dummy)");
      output = getDummyData(window);
    } else {
      // Check if any tokens exist
      const tokenFiles = await listTokenFiles();
      if (tokenFiles.length === 0) {
        return res.send(
          renderErrorPage(
            "Not Authenticated",
            "Please connect your banks first by clicking 'Connect Banks' on the home page."
          )
        );
      }

      // Get date window
      const dateWindow = calculateDateWindow(window);

      // Fetch from all tokens
      const { items, transactions } = await listAllTransactionsFromAllTokens(
        CLIENT_ID,
        CLIENT_SECRET,
        TOKEN_URL,
        dateWindow.from,
        dateWindow.to,
        API_BASE
      );

      // Convert items to account summaries
      const accounts = items.map((item) => ({
        kind: item.kind,
        id: item.kind === "account" ? item.account_id : item.card_id,
        provider: item.provider,
        type: item.kind === "account" ? item.account_type : item.card_type,
        display_name: item.display_name,
        currency: item.currency,
      }));

      // Fetch excluded expenses with error handling
      const { fetchExcludedExpenses, isSheetsConfigured } = await import("./sheets");
      let excludedExpenses: any[] = [];
      let sheetsError: string | undefined;

      if (isSheetsConfigured()) {
        try {
          excludedExpenses = await fetchExcludedExpenses();
        } catch (error: any) {
          console.warn("⚠️  Failed to fetch excluded expenses:", error.message);
          sheetsError = error.message;
          // Continue without excluded expenses
        }
      }

      output = {
        window: {
          mode: window,
          from: dateWindow.from,
          to: dateWindow.to,
        },
        accounts,
        transactions,
        excludedExpenses,
        reimbursements: excludedExpenses, // Backward compatibility
        sheetsError,
      };
    }

    // Log to console for easy copy/paste
    // console.log("\n" + "=".repeat(60));
    // console.log("📋 JSON OUTPUT (copy to ChatGPT)");
    // console.log("=".repeat(60));
    // console.log(JSON.stringify(output, null, 2));
    // console.log("=".repeat(60) + "\n");

    res.send(renderEnhancedTransactionsPage(output));
  } catch (error: any) {
    console.error("❌ Error fetching transactions:", error);
    res.send(renderErrorPage("Transaction Fetch Failed", error.message));
  }
});

/**
 * POST /disconnect - Disconnect a specific connection
 * Deletes the token file for the specified connection
 */
app.post("/disconnect/:tokenFileName", requireAuth, async (req: Request, res: Response) => {
  try {
    if (MODE === "dummy") {
      return res.status(400).send("Disconnect is disabled in dummy mode");
    }

    const { tokenFileName } = req.params;

    await disconnectConnection(tokenFileName);

    // Redirect back to home
    res.redirect("/");
  } catch (error: any) {
    console.error("❌ Disconnect failed:", error);
    res.send(renderErrorPage("Disconnect Failed", error.message));
  }
});

/**
 * POST /api/generate-insights - Generate AI insights for transactions
 * Returns categories and financial advice from OpenAI
 */
app.post("/api/generate-insights", requireAuth, async (req: Request, res: Response) => {
  try {
    const { window } = req.body;

    if (!window || (window !== "weekly" && window !== "monthly")) {
      return res.status(400).json({
        success: false,
        error: 'Window must be "weekly" or "monthly"',
      });
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        success: false,
        error: "OpenAI API key not configured. Set OPENAI_API_KEY in your .env file to use AI insights.",
        missingConfig: true,
      });
    }

    console.log(`\n🤖 Generating AI insights for ${window} period...`);

    // Get transactions and calculate data
    let transactions, dateWindow;

    if (MODE === "dummy") {
      const output = getDummyData(window as WindowMode);
      transactions = output.transactions;
      dateWindow = output.window;
    } else {
      const tokenFiles = await listTokenFiles();
      if (tokenFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No bank connections found. Please connect your banks first.",
        });
      }

      dateWindow = calculateDateWindow(window as WindowMode);
      const result = await listAllTransactionsFromAllTokens(
        CLIENT_ID,
        CLIENT_SECRET,
        TOKEN_URL,
        dateWindow.from,
        dateWindow.to,
        API_BASE
      );
      transactions = result.transactions;
    }

    // Filter excluded expenses if configured
    const { fetchExcludedExpenses, isSheetsConfigured } = await import("./sheets");
    if (isSheetsConfigured()) {
      try {
        const excludedExpenses = await fetchExcludedExpenses();
        const { filterExcludedExpenses } = await import("./email/excludedExpensesFilter");
        transactions = filterExcludedExpenses(transactions, excludedExpenses, dateWindow);
      } catch (error: any) {
        console.warn("⚠️  Failed to filter excluded expenses:", error.message);
      }
    }

    // Separate large transactions from regular transactions
    const { getLargeTransactionThreshold, getWeeklyAllowance, getMonthlyAllowance } = await import("./config");
    const largeTransactionThreshold = getLargeTransactionThreshold();
    const budget = window === "weekly" ? getWeeklyAllowance() : getMonthlyAllowance();

    const { extractLargeTransactions } = await import("./email/helpers");
    const largeTransactions = extractLargeTransactions(transactions, largeTransactionThreshold);
    const regularTransactions = transactions.filter(
      t => !(t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeTransactionThreshold)
    );

    // Calculate stats from regular transactions
    const totalSpend = Math.abs(
      regularTransactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
    );

    // Get aggregated data
    const { extractBiggestPurchases, aggregateByMerchant, aggregateByCategory } = await import("./email/helpers");
    const biggestPurchases = extractBiggestPurchases(regularTransactions, 5);
    const topMerchants = aggregateByMerchant(regularTransactions, 10);
    const categoryTotals = aggregateByCategory(regularTransactions);

    // Generate AI response
    const { generateFinancialAdviceAndBreakdown } = await import("./email/financialAdvice");
    const aiResponse = await generateFinancialAdviceAndBreakdown({
      periodLabel: window === "weekly" ? "This Week" : "This Month",
      dateRange: `${dateWindow.from} - ${dateWindow.to}`,
      totalSpend,
      budget,
      overUnder: totalSpend - budget,
      transactionCount: regularTransactions.length,
      biggestPurchases,
      topMerchants,
      categoryTotals,
    });

    console.log(`✅ AI insights generated successfully`);

    res.json({
      success: true,
      data: {
        categories: aiResponse.categories,
        spendingBreakdown: aiResponse.spendingBreakdown,
        advice: aiResponse.advice,
        totalSpend,
        budget,
        transactionCount: regularTransactions.length,
      },
    });

  } catch (error: any) {
    console.error("❌ Error generating insights:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI insights",
    });
  }
});

/**
 * POST /api/preview-email - Generate email preview HTML
 * Takes AI response data and returns full email HTML
 */
app.post("/api/preview-email", requireAuth, async (req: Request, res: Response) => {
  try {
    const { window, aiResponse } = req.body;

    if (!window || (window !== "weekly" && window !== "monthly")) {
      return res.status(400).json({
        error: 'Window must be "weekly" or "monthly"',
      });
    }

    if (!aiResponse || !aiResponse.categories || !aiResponse.spendingBreakdown || !aiResponse.advice) {
      return res.status(400).json({
        error: "Missing required AI response data",
      });
    }

    console.log(`\n📧 Generating email preview for ${window} period...`);

    // Get transactions and calculate data (same as generate-insights)
    let transactions, dateWindow;

    if (MODE === "dummy") {
      const output = getDummyData(window as WindowMode);
      transactions = output.transactions;
      dateWindow = output.window;
    } else {
      const tokenFiles = await listTokenFiles();
      if (tokenFiles.length === 0) {
        return res.status(400).json({
          error: "No bank connections found",
        });
      }

      dateWindow = calculateDateWindow(window as WindowMode);
      const result = await listAllTransactionsFromAllTokens(
        CLIENT_ID,
        CLIENT_SECRET,
        TOKEN_URL,
        dateWindow.from,
        dateWindow.to,
        API_BASE
      );
      transactions = result.transactions;
    }

    // Filter excluded expenses
    const { fetchExcludedExpenses, isSheetsConfigured } = await import("./sheets");
    if (isSheetsConfigured()) {
      try {
        const excludedExpenses = await fetchExcludedExpenses();
        const { filterExcludedExpenses } = await import("./email/excludedExpensesFilter");
        transactions = filterExcludedExpenses(transactions, excludedExpenses, dateWindow);
      } catch (error: any) {
        console.warn("⚠️  Failed to filter excluded expenses:", error.message);
      }
    }

    // Separate large transactions
    const { getLargeTransactionThreshold, getWeeklyAllowance, getMonthlyAllowance } = await import("./config");
    const largeTransactionThreshold = getLargeTransactionThreshold();
    const budget = window === "weekly" ? getWeeklyAllowance() : getMonthlyAllowance();

    const { extractLargeTransactions } = await import("./email/helpers");
    const largeTransactions = extractLargeTransactions(transactions, largeTransactionThreshold);
    const regularTransactions = transactions.filter(
      t => !(t.amountGBP < 0 && Math.abs(t.amountGBP) >= largeTransactionThreshold)
    );

    // Calculate all stats
    const totalSpend = Math.abs(
      regularTransactions.filter(t => t.amountGBP < 0).reduce((sum, t) => sum + t.amountGBP, 0)
    );
    const credits = regularTransactions.filter(t => t.amountGBP > 0).reduce((sum, t) => sum + t.amountGBP, 0);

    // Get aggregated data
    const { extractBiggestPurchases, aggregateByMerchant } = await import("./email/helpers");
    const biggestPurchases = extractBiggestPurchases(regularTransactions, 5);
    const topMerchants = aggregateByMerchant(regularTransactions, 5);

    // Render HTML sections
    const {
      renderBiggestPurchasesSection,
      renderTopMerchantsSection,
      renderLargeTransactionsSection,
    } = await import("./email/sections");

    const biggestPurchasesHtml = renderBiggestPurchasesSection(biggestPurchases);
    const topMerchantsHtml = renderTopMerchantsSection(topMerchants);
    const largeTransactionsHtml = renderLargeTransactionsSection(largeTransactions);

    // Format period label
    const periodLabel = window === "weekly" ? "Weekly" : "Monthly";
    const emoji = window === "weekly" ? "📅" : "📊";

    // Calculate budget metrics
    const overUnder = totalSpend - budget;
    const overUnderLabel = overUnder > 0
      ? `£${Math.abs(overUnder).toFixed(2)} over budget`
      : overUnder < 0
        ? `£${Math.abs(overUnder).toFixed(2)} under budget`
        : "On target";
    const overUnderType: 'over' | 'under' | 'on-target' = overUnder > 0 ? 'over' : overUnder < 0 ? 'under' : 'on-target';

    // Average transaction
    const avgTransaction = regularTransactions.length > 0
      ? Math.abs(totalSpend / regularTransactions.filter(t => t.amountGBP < 0).length)
      : 0;

    // Build template data
    const { renderWeeklyBudgetEmail } = await import("./email/weeklyBudgetTemplate");
    const templateData = {
      periodLabel: `${periodLabel} Budget Summary`,
      dateRange: `${dateWindow.from} – ${dateWindow.to}`,
      totalSpend: `£${totalSpend.toFixed(2)}`,
      budget: `£${budget.toFixed(2)}`,
      overUnderLabel,
      overUnderType,
      transactionCount: regularTransactions.length,
      avgTransaction: `£${avgTransaction.toFixed(2)}`,
      remainingBudget: `£${(budget - totalSpend).toFixed(2)}`,
      biggestPurchasesHtml,
      topMerchantsHtml,
      spendingBreakdownHtml: aiResponse.spendingBreakdown,
      largeTransactionsHtml,
      advisorAdviceHtml: aiResponse.advice,
    };

    const htmlContent = renderWeeklyBudgetEmail(templateData);

    console.log(`✅ Email preview generated successfully`);

    res.send(htmlContent);

  } catch (error: any) {
    console.error("❌ Error generating email preview:", error);
    res.status(500).json({
      error: error.message || "Failed to generate email preview",
    });
  }
});

/**
 * GET /diag - Diagnostic information
 * Returns configuration and connection status as JSON
 */
app.get("/diag", requireAuth, async (req: Request, res: Response) => {
  try {
    const tokenFiles = await listTokenFiles();

    // Get connected items if tokens exist
    let connected = {
      accountsSupported: true,
      accountsCount: 0,
      cardsCount: 0,
    };

    if (MODE === "live" && tokenFiles.length > 0) {
      try {
        const items = await listAllConnectedItemsFromAllTokens(
          CLIENT_ID,
          CLIENT_SECRET,
          TOKEN_URL,
          API_BASE
        );
        connected.accountsCount = items.filter((i) => i.kind === "account").length;
        connected.cardsCount = items.filter((i) => i.kind === "card").length;
      } catch (error: any) {
        // If accounts endpoint fails, mark as unsupported
        if (error.message.includes("endpoint_not_supported") || error.message.includes("501")) {
          connected.accountsSupported = false;
        }
      }
    }

    // Check Google Sheets configuration
    const { isSheetsConfigured } = await import("./sheets");
    let sheetsStatus = {
      configured: false,
      spreadsheetId: "",
      range: "",
      ok: false,
    };

    if (isSheetsConfigured()) {
      sheetsStatus.configured = true;
      sheetsStatus.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
      sheetsStatus.range = process.env.GOOGLE_SHEETS_RANGE || "Excluded Expenses!A:E";

      // Try to fetch to check access
      try {
        const { fetchExcludedExpenses } = await import("./sheets");
        await fetchExcludedExpenses();
        sheetsStatus.ok = true;
      } catch (error: any) {
        sheetsStatus.ok = false;
      }
    }

    const diag = {
      mode: MODE,
      tokens: tokenFiles.map((f) => f.split("/").pop()),
      scopes: SCOPES,
      providersParam: PROVIDERS || "(omitted - allows all providers including cards)",
      connected,
      sheets: sheetsStatus,
      notes: [
        PROVIDERS ? `providers parameter set to: ${PROVIDERS}` : "providers parameter omitted (recommended for cards)",
        connected.accountsSupported ? "Accounts API supported" : "Accounts API returned 501 (using Cards API)",
        `Total connections: ${connected.accountsCount} accounts, ${connected.cardsCount} cards`,
      ],
    };

    res.json(diag);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DEBUG: GET /debug/cards - List all cards
 * Shows raw card data from TrueLayer Cards API
 */
app.get("/debug/cards", requireAuth, async (req: Request, res: Response) => {
  try {
    if (MODE === "dummy") {
      return res.json({ error: "Debug routes disabled in dummy mode" });
    }

    const tokenFiles = await listTokenFiles();
    if (tokenFiles.length === 0) {
      return res.json({ error: "No tokens found. Connect a bank first." });
    }

    const allCards: any[] = [];

    for (const file of tokenFiles) {
      try {
        const { getValidAccessToken: getTokenFromFile } = await import("./tokenManager");
        const accessToken = await getTokenFromFile(file, CLIENT_ID, CLIENT_SECRET, TOKEN_URL);

        const response = await (await import("axios")).default.get(
          `${API_BASE}/data/v1/cards`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.data?.results) {
          allCards.push(...response.data.results);
        }
      } catch (error: any) {
        console.error(`Error fetching cards for ${file}:`, error.message);
      }
    }

    res.json({
      count: allCards.length,
      cards: allCards.map((c) => {
        // Extract card_id with fallbacks (same logic as data.ts)
        const cardId = c.card_id ?? c.id ?? c.account_id ?? null;

        return {
          card_id: cardId,
          card_id_source: c.card_id ? "card_id" : c.id ? "id" : c.account_id ? "account_id" : "MISSING",
          card_type: c.card_type,
          display_name: c.display_name,
          provider: c.provider?.display_name || c.provider?.provider_id,
          currency: c.currency,
          partial_card_number: c.partial_card_number,
          available_keys: Object.keys(c),
          has_card_id: !!cardId,
        };
      }),
      raw: allCards,
      diagnostics: {
        totalCards: allCards.length,
        cardsWithId: allCards.filter((c) => c.card_id ?? c.id ?? c.account_id).length,
        cardsWithoutId: allCards.filter((c) => !(c.card_id ?? c.id ?? c.account_id)).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DEBUG: GET /debug/cards/:cardId - Fetch transactions for a specific card
 * Shows posted + pending transactions with merge details
 */
app.get("/debug/cards/:cardId", requireAuth, async (req: Request, res: Response) => {
  try {
    if (MODE === "dummy") {
      return res.json({ error: "Debug routes disabled in dummy mode" });
    }

    const { cardId } = req.params;
    const window = (req.query.window as "weekly" | "monthly") || "weekly";

    const tokenFiles = await listTokenFiles();
    if (tokenFiles.length === 0) {
      return res.json({ error: "No tokens found. Connect a bank first." });
    }

    const dateWindow = calculateDateWindow(window);

    // Try to fetch with each token until one works
    for (const file of tokenFiles) {
      try {
        const { getValidAccessToken: getTokenFromFile } = await import("./tokenManager");
        const accessToken = await getTokenFromFile(file, CLIENT_ID, CLIENT_SECRET, TOKEN_URL);

        const axios = (await import("axios")).default;

        // Fetch posted
        const postedUrl = `${API_BASE}/data/v1/cards/${cardId}/transactions?from=${dateWindow.from}&to=${dateWindow.to}`;
        const postedResp = await axios.get(postedUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Fetch pending
        const pendingUrl = `${API_BASE}/data/v1/cards/${cardId}/transactions/pending`;
        const pendingResp = await axios.get(pendingUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const posted = postedResp.data?.results || [];
        const pending = pendingResp.data?.results || [];

        return res.json({
          window: { mode: window, from: dateWindow.from, to: dateWindow.to },
          cardId,
          posted: { count: posted.length, transactions: posted },
          pending: { count: pending.length, transactions: pending },
          summary: {
            totalPosted: posted.length,
            totalPending: pending.length,
            totalCombined: posted.length + pending.length,
          },
        });
      } catch (error: any) {
        // Try next token
        continue;
      }
    }

    res.status(404).json({ error: "Card not found or no access with available tokens" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 TrueLayer Transaction Aggregator");
  console.log("=".repeat(60));
  console.log(`\n🌐 Server: http://localhost:${PORT}`);
  console.log(`📦 Mode: ${MODE.toUpperCase()}`);
  console.log(`🌍 Timezone: ${process.env.TZ || "System default"}`);

  if (MODE === "dummy") {
    console.log("\n⚠️  DUMMY MODE - Using fake data (no API calls)");
    console.log("💡 Set MODE=live in .env to use real TrueLayer data");
  } else {
    console.log(`\n🔑 Client ID: ${CLIENT_ID.substring(0, 8)}...`);
    console.log(`🔗 Redirect URI: ${REDIRECT_URI}`);
    console.log(`🔐 Auth Base: ${AUTH_BASE}`);
    console.log(`🌐 API Base: ${API_BASE}`);
  }

  console.log(`\n📅 Windows:`);
  console.log(`   Weekly: Last ${process.env.WEEKLY_DAYS || 7} days`);
  console.log(`   Monthly: Previous ${process.env.MONTHLY_MONTHS || 1} month(s)`);

  console.log("\n" + "=".repeat(60));
  console.log(`\n👉 Open http://localhost:${PORT} to get started\n`);

  // Start scheduler for automated alerts
  startScheduler();
});
