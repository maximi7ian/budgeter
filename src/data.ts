/**
 * TrueLayer Data API helpers
 * Fetches accounts, cards, and transactions with automatic fallback
 */

import axios from "axios";
import {
  TLAccount,
  TLCard,
  TLTransaction,
  Txn,
  AccountSummary,
  TransactionOutput,
  WindowMode,
  ConnectedItem,
} from "./types";
import { getValidAccessToken } from "./truelayer";
import { fetchExcludedExpenses, isSheetsConfigured, getDummyExcludedExpenses } from "./sheets";
import { listTokenFiles, updateTokenMetadata, deleteToken as deleteTokenFile } from "./tokenStore";
import { getValidAccessToken as getValidAccessTokenFromFile } from "./tokenManager";

/**
 * Connection mapping - links token files to their providers
 */
export interface ConnectionInfo {
  tokenFile: string;
  tokenFileName: string;
  providers: string[];
  items: ConnectedItem[];
}

/**
 * Fetch all connected accounts
 */
async function fetchAccounts(
  accessToken: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<TLAccount[]> {
  try {
    const response = await axios.get(`${apiBase}/data/v1/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.results || [];
  } catch (error: any) {
    // Check for 501 or endpoint_not_supported
    if (
      error.response?.status === 501 ||
      error.response?.data?.error === "endpoint_not_supported"
    ) {
      console.log("ℹ️  Accounts endpoint not supported (501), will try Cards API");
      return [];
    }
    console.error("Fetch accounts error:", error.response?.data || error.message);
    throw new Error(`Failed to fetch accounts: ${error.message}`);
  }
}

/**
 * Fetch all connected cards
 */
async function fetchCards(
  accessToken: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<TLCard[]> {
  try {
    const response = await axios.get(`${apiBase}/data/v1/cards`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.results || [];
  } catch (error: any) {
    // Cards endpoint might also not be supported
    if (
      error.response?.status === 501 ||
      error.response?.data?.error === "endpoint_not_supported"
    ) {
      console.log("ℹ️  Cards endpoint not supported (501)");
      return [];
    }
    console.error("Fetch cards error:", error.response?.data || error.message);
    throw new Error(`Failed to fetch cards: ${error.message}`);
  }
}

/**
 * List all connected items (accounts + cards)
 */
export async function listConnectedItems(
  accessToken: string,
  apiBase: string
): Promise<ConnectedItem[]> {
  const items: ConnectedItem[] = [];

  // Try accounts
  console.log("📋 Fetching accounts from /data/v1/accounts...");
  const accounts = await fetchAccounts(accessToken, apiBase);
  console.log(`   → Found ${accounts.length} account(s)`);
  for (const acc of accounts) {
    const provider = acc.provider?.display_name || acc.provider?.provider_id || "Unknown";
    console.log(`   ✓ Account: ${provider} - ${acc.display_name} (${acc.account_id})`);
    items.push({
      kind: "account",
      account_id: acc.account_id,
      account_type: acc.account_type,
      provider,
      display_name: acc.display_name,
      currency: acc.currency,
    });
  }

  // Try cards
  console.log("💳 Fetching cards from /data/v1/cards...");
  const cards = await fetchCards(accessToken, apiBase);
  console.log(`   → Found ${cards.length} card(s)`);

  for (const card of cards) {
    // Robust card_id extraction with fallbacks
    const cardId = (card as any).card_id ?? (card as any).id ?? (card as any).account_id ?? null;

    // Debug: Show available keys if card_id is missing
    if (!cardId) {
      console.warn("   ⚠️  Card missing card_id! Available keys:", Object.keys(card));
      console.warn("   ⚠️  Raw card object:", JSON.stringify(card, null, 2));
      continue; // Skip this card
    }

    const provider = card.provider?.display_name || card.provider?.provider_id || "Unknown";
    const displayName = card.display_name || (card as any).name_on_card || "Card";
    const cardType = card.card_type || (card as any).type || "CARD";
    const currency = card.currency || "GBP";

    console.log(`   ✓ Card: ${provider} - ${displayName} (${cardId})`);

    if (provider.toLowerCase().includes("american express") || provider.toLowerCase().includes("amex")) {
      console.log(`   🎯 AMEX CARD DETECTED: ${cardId}`);
      console.log(`      Provider: ${provider}`);
      console.log(`      Display: ${displayName}`);
      console.log(`      Type: ${cardType}`);
    }

    items.push({
      kind: "card",
      card_id: cardId,
      card_type: cardType,
      provider,
      display_name: displayName,
      currency,
    });
  }

  console.log(`✅ Total connected items: ${items.length} (${accounts.length} accounts, ${cards.length} cards)`);
  return items;
}

/**
 * Fetch transactions for a specific account
 */
async function fetchAccountTransactions(
  accessToken: string,
  accountId: string,
  from: string,
  to: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<TLTransaction[]> {
  try {
    const response = await axios.get(
      `${apiBase}/data/v1/accounts/${accountId}/transactions`,
      {
        params: { from, to },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.results || [];
  } catch (error: any) {
    if (
      error.response?.status === 501 ||
      error.response?.data?.error === "endpoint_not_supported"
    ) {
      console.warn(`Account ${accountId} transactions not supported (501), skipping`);
      return [];
    }
    console.error(
      `Fetch transactions error for account ${accountId}:`,
      error.response?.data || error.message
    );
    return [];
  }
}

/**
 * Fetch posted transactions for a specific card
 */
async function fetchCardPostedTransactions(
  accessToken: string,
  cardId: string,
  from: string,
  to: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<TLTransaction[]> {
  try {
    const response = await axios.get(`${apiBase}/data/v1/cards/${cardId}/transactions`, {
      params: { from, to },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.results || [];
  } catch (error: any) {
    if (
      error.response?.status === 501 ||
      error.response?.data?.error === "endpoint_not_supported"
    ) {
      console.warn(`Card ${cardId} posted transactions not supported (501), skipping`);
      return [];
    }
    console.error(
      `Fetch posted transactions error for card ${cardId}:`,
      error.response?.data || error.message
    );
    return [];
  }
}

/**
 * Fetch pending transactions for a specific card
 */
async function fetchCardPendingTransactions(
  accessToken: string,
  cardId: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<TLTransaction[]> {
  try {
    const response = await axios.get(
      `${apiBase}/data/v1/cards/${cardId}/transactions/pending`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.results || [];
  } catch (error: any) {
    if (
      error.response?.status === 501 ||
      error.response?.data?.error === "endpoint_not_supported"
    ) {
      console.warn(`Card ${cardId} pending transactions not supported (501), skipping`);
      return [];
    }
    console.error(
      `Fetch pending transactions error for card ${cardId}:`,
      error.response?.data || error.message
    );
    return [];
  }
}

/**
 * Generate deduplication key for transaction
 */
function generateTxnKey(txn: TLTransaction, cardId: string, provider: string): string {
  const date = txn.timestamp.split("T")[0];
  const amount = Math.abs(txn.amount).toFixed(2);
  const desc = (txn.description || "").toLowerCase().trim();
  return `${provider}|${cardId}|${date}|${amount}|${desc}`;
}

/**
 * Fetch and merge posted + pending transactions for a card
 * Deduplicates based on date, amount, description
 */
async function fetchCardTransactions(
  accessToken: string,
  cardId: string,
  provider: string,
  from: string,
  to: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<{ posted: TLTransaction[]; pending: TLTransaction[] }> {
  console.log(`   💳 Fetching card transactions for ${provider} (${cardId})`);
  console.log(`      Date range: ${from} to ${to}`);
  console.log(`      Calling: GET /data/v1/cards/${cardId}/transactions (posted)`);
  console.log(`      Calling: GET /data/v1/cards/${cardId}/transactions/pending`);

  // Fetch both
  const [posted, pending] = await Promise.all([
    fetchCardPostedTransactions(accessToken, cardId, from, to, apiBase),
    fetchCardPendingTransactions(accessToken, cardId, apiBase),
  ]);

  console.log(`      Raw results: ${posted.length} posted, ${pending.length} pending`);

  // Build set of posted transaction keys
  const postedKeys = new Set<string>();
  for (const txn of posted) {
    postedKeys.add(generateTxnKey(txn, cardId, provider));
  }

  // Filter pending to remove duplicates
  const uniquePending = pending.filter((txn) => {
    const key = generateTxnKey(txn, cardId, provider);
    return !postedKeys.has(key);
  });

  const duplicatesRemoved = pending.length - uniquePending.length;
  console.log(
    `      After deduplication: ${posted.length} posted, ${uniquePending.length} pending (${duplicatesRemoved} duplicates removed)`
  );

  return { posted, pending: uniquePending };
}

/**
 * Calculate date window based on mode
 */
export function calculateDateWindow(mode: "weekly" | "monthly"): { from: string; to: string } {
  const now = new Date();

  if (mode === "weekly") {
    const weeklyDays = parseInt(process.env.WEEKLY_DAYS || "7", 10);
    const from = new Date(now);
    from.setDate(from.getDate() - (weeklyDays - 1)); // 7 days => go back 6

    return {
      from: from.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    };
  } else {
    // monthly: previous full month
    const monthlyMonths = parseInt(process.env.MONTHLY_MONTHS || "1", 10);

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - monthlyMonths, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - monthlyMonths + 1, 0);

    return {
      from: startOfPrevMonth.toISOString().split("T")[0],
      to: endOfPrevMonth.toISOString().split("T")[0],
    };
  }
}

/**
 * Normalize TrueLayer transaction to our format
 */
function normalizeTransaction(
  txn: TLTransaction,
  item: ConnectedItem,
  status: "posted" | "pending" = "posted"
): Txn {
  const postedDate = txn.timestamp.split("T")[0];

  // Amount normalization depends on source type:
  // - ACCOUNTS: TrueLayer returns negative for debits (spend), positive for credits
  // - CARDS: TrueLayer returns POSITIVE for debits (spend), NEGATIVE for credits (refunds)
  // We normalize to: negative = spend, positive = refund/credit
  let amountGBP = txn.amount;

  if (item.kind === "card") {
    // For cards: flip the sign so spend is negative
    // If TrueLayer shows +50.00 (card spend), we want -50.00
    // If TrueLayer shows -10.00 (refund), we want +10.00
    const originalAmount = txn.amount;
    amountGBP = -txn.amount;

    // Debug log for first few transactions
    if (Math.random() < 0.1) {
      console.log(
        `      [Card Amount] ${txn.description?.substring(0, 30) || "Transaction"}: ${originalAmount} → ${amountGBP} (flipped)`
      );
    }
  }
  // For accounts, use amount as-is (already negative for spend)

  return {
    sourceKind: item.kind,
    sourceId: item.kind === "account" ? item.account_id : item.card_id,
    provider: item.provider,
    postedDate,
    amountGBP,
    currency: txn.currency,
    description: txn.description || "",
    merchant: txn.merchant_name,
    status,
    raw: txn,
  };
}

/**
 * Fetch all transactions for all connected items
 */
export async function fetchAllTransactions(
  mode: "weekly" | "monthly",
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
  apiBase: string
): Promise<TransactionOutput> {
  const window = calculateDateWindow(mode);
  console.log(`📅 Fetching ${mode} transactions: ${window.from} to ${window.to}`);

  // Get valid access token
  const accessToken = await getValidAccessToken(clientId, clientSecret, tokenUrl);

  // Fetch all connected items
  console.log("🏦 Fetching connected items...");
  const items = await listConnectedItems(accessToken, apiBase);
  console.log(`✅ Found ${items.length} items (${items.filter(i => i.kind === "account").length} accounts, ${items.filter(i => i.kind === "card").length} cards)`);

  // Build account summaries
  const accountSummaries: AccountSummary[] = items.map((item) => ({
    kind: item.kind,
    id: item.kind === "account" ? item.account_id : item.card_id,
    provider: item.provider,
    type: item.kind === "account" ? item.account_type : item.card_type,
    display_name: item.display_name,
    currency: item.currency,
  }));

  // Fetch transactions for each item
  const allTransactions: Txn[] = [];

  for (const item of items) {
    if (item.kind === "account") {
      console.log(`💳 Fetching transactions for account: ${item.display_name} (${item.account_id})...`);

      const txns = await fetchAccountTransactions(
        accessToken,
        item.account_id,
        window.from,
        window.to,
        apiBase
      );

      console.log(`  → Found ${txns.length} transactions`);
      const normalized = txns.map((txn) => normalizeTransaction(txn, item, "posted"));
      allTransactions.push(...normalized);
    } else {
      // Validate card_id exists before fetching
      if (!item.card_id) {
        console.error(`❌ Skipping card with missing card_id: ${item.display_name}`);
        console.error(`   Item:`, JSON.stringify(item, null, 2));
        continue;
      }

      console.log(`💳 Fetching transactions for card: ${item.display_name} (${item.card_id})...`);
      console.log(`   Provider: ${item.provider}`);
      console.log(`   Card ID: ${item.card_id}`);
      console.log(`   Calling: /data/v1/cards/${item.card_id}/transactions`);
      console.log(`   Calling: /data/v1/cards/${item.card_id}/transactions/pending`);

      const { posted, pending } = await fetchCardTransactions(
        accessToken,
        item.card_id,
        item.provider,
        window.from,
        window.to,
        apiBase
      );

      // Normalize both posted and pending
      const normalizedPosted = posted.map((txn) => normalizeTransaction(txn, item, "posted"));
      const normalizedPending = pending.map((txn) => normalizeTransaction(txn, item, "pending"));

      allTransactions.push(...normalizedPosted, ...normalizedPending);
    }
  }

  console.log(`✅ Total transactions: ${allTransactions.length}`);

  // Fetch excluded expenses from Google Sheets (optional)
  let reimbursements = undefined;
  if (isSheetsConfigured()) {
    try {
      console.log("📄 Fetching excluded expenses from Google Sheets...");
      reimbursements = await fetchExcludedExpenses();
    } catch (error: any) {
      console.warn(`⚠️  Failed to fetch Google Sheets: ${error.message}`);
      console.log("Continuing without excluded expenses data...");
    }
  }

  return {
    window: {
      from: window.from,
      to: window.to,
      mode,
    },
    accounts: accountSummaries,
    transactions: allTransactions,
    excludedExpenses: reimbursements,
    reimbursements, // Backward compatibility
  };
}

/**
 * Get dummy data for testing
 */
export function getDummyData(mode: "weekly" | "monthly"): TransactionOutput {
  const window = calculateDateWindow(mode);

  return {
    window: {
      from: window.from,
      to: window.to,
      mode,
    },
    accounts: [
      {
        kind: "account",
        id: "acc_dummy_monzo",
        provider: "Monzo",
        type: "TRANSACTION",
        display_name: "Monzo Current Account",
        currency: "GBP",
      },
      {
        kind: "card",
        id: "card_dummy_amex",
        provider: "American Express",
        type: "CREDIT",
        display_name: "Amex Gold Card",
        currency: "GBP",
      },
    ],
    transactions: [
      {
        sourceKind: "account",
        sourceId: "acc_dummy_monzo",
        provider: "Monzo",
        postedDate: window.to,
        amountGBP: -45.67,
        currency: "GBP",
        description: "Tesco Express",
        merchant: "Tesco",
        status: "posted",
      },
      {
        sourceKind: "account",
        sourceId: "acc_dummy_monzo",
        provider: "Monzo",
        postedDate: window.to,
        amountGBP: -12.5,
        currency: "GBP",
        description: "Pret A Manger",
        merchant: "Pret A Manger",
        status: "posted",
      },
      {
        sourceKind: "card",
        sourceId: "card_dummy_amex",
        provider: "American Express",
        postedDate: window.from,
        amountGBP: -901.82,
        currency: "GBP",
        description: "British Airways",
        merchant: "British Airways",
        status: "posted",
      },
      {
        sourceKind: "card",
        sourceId: "card_dummy_amex",
        provider: "American Express",
        postedDate: window.to,
        amountGBP: -23.45,
        currency: "GBP",
        description: "Amazon",
        merchant: "Amazon",
        status: "pending",
      },
    ],
    excludedExpenses: getDummyExcludedExpenses(),
    reimbursements: getDummyExcludedExpenses(), // Backward compatibility
  };
}

/**
 * List all connected items from all token files
 * Deduplicates by account_id/card_id across all tokens
 */
export async function listAllConnectedItemsFromAllTokens(
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<ConnectedItem[]> {
  const tokenFiles = await listTokenFiles();

  if (tokenFiles.length === 0) {
    console.log("ℹ️  No token files found");
    return [];
  }

  console.log(`🔍 Found ${tokenFiles.length} token file(s)`);

  const allItems: ConnectedItem[] = [];
  const seenIds = new Set<string>(); // Track account_id/card_id to dedupe

  for (const file of tokenFiles) {
    try {
      console.log(`\n📂 Processing token file: ${file}`);

      // Get valid access token (auto-refreshes if needed)
      const accessToken = await getValidAccessTokenFromFile(file, clientId, clientSecret, tokenUrl);

      // Fetch items for this token
      const items = await listConnectedItems(accessToken, apiBase);

      // Add to results, deduplicating by ID
      for (const item of items) {
        const id = item.kind === "account" ? item.account_id : item.card_id;

        if (!seenIds.has(id)) {
          seenIds.add(id);
          allItems.push(item);
          console.log(
            `  ✅ Added ${item.kind}: ${item.provider} - ${item.display_name} (${id})`
          );
        } else {
          console.log(`  ⏭️  Skipped duplicate ${item.kind}: ${id}`);
        }
      }
    } catch (error: any) {
      console.error(`⚠️  Error processing token file ${file}:`, error.message);
      // Continue with other tokens even if one fails
    }
  }

  console.log(`\n✅ Total unique items: ${allItems.length}`);
  return allItems;
}

/**
 * Fetch all transactions from all token files
 * Deduplicates items and returns merged transactions
 */
export async function listAllTransactionsFromAllTokens(
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
  fromISO: string,
  toISO: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<{ items: ConnectedItem[]; transactions: Txn[] }> {
  const tokenFiles = await listTokenFiles();

  if (tokenFiles.length === 0) {
    console.log("ℹ️  No token files found");
    return { items: [], transactions: [] };
  }

  console.log(`🔍 Found ${tokenFiles.length} token file(s)`);
  console.log(`📅 Fetching transactions from ${fromISO} to ${toISO}`);

  const allItems: ConnectedItem[] = [];
  const allTransactions: Txn[] = [];
  const seenItemIds = new Set<string>(); // Track account_id/card_id to dedupe

  for (const file of tokenFiles) {
    try {
      console.log(`\n📂 Processing token file: ${file}`);

      // Get valid access token (auto-refreshes if needed)
      const accessToken = await getValidAccessTokenFromFile(file, clientId, clientSecret, tokenUrl);

      // Fetch items for this token
      const items = await listConnectedItems(accessToken, apiBase);

      // Process each item
      for (const item of items) {
        const id = item.kind === "account" ? item.account_id : item.card_id;

        // Add to items list (dedupe)
        if (!seenItemIds.has(id)) {
          seenItemIds.add(id);
          allItems.push(item);
        } else {
          console.log(`  ⏭️  Skipping duplicate item: ${id}`);
          continue; // Don't fetch transactions for duplicate items
        }

        // Fetch transactions for this item
        if (item.kind === "account") {
          console.log(
            `🏦 Fetching transactions for account: ${item.display_name} (${item.account_id})...`
          );

          const txns = await fetchAccountTransactions(
            accessToken,
            item.account_id,
            fromISO,
            toISO,
            apiBase
          );

          const normalized = txns.map((txn) => normalizeTransaction(txn, item, "posted"));
          allTransactions.push(...normalized);
          console.log(`  → Fetched ${normalized.length} transactions`);
        } else {
          // Validate card_id exists
          if (!item.card_id) {
            console.error(`❌ Skipping card with missing card_id: ${item.display_name}`);
            continue;
          }

          console.log(
            `💳 Fetching transactions for card: ${item.display_name} (${item.card_id})...`
          );
          console.log(`   Card ID: ${item.card_id}`);

          const { posted, pending } = await fetchCardTransactions(
            accessToken,
            item.card_id,
            item.provider,
            fromISO,
            toISO,
            apiBase
          );

          const normalizedPosted = posted.map((txn) => normalizeTransaction(txn, item, "posted"));
          const normalizedPending = pending.map((txn) =>
            normalizeTransaction(txn, item, "pending")
          );

          allTransactions.push(...normalizedPosted, ...normalizedPending);
          console.log(
            `  → Fetched ${normalizedPosted.length} posted + ${normalizedPending.length} pending transactions`
          );
        }
      }
    } catch (error: any) {
      console.error(`⚠️  Error processing token file ${file}:`, error.message);
      // Continue with other tokens even if one fails
    }
  }

  console.log(`\n✅ Total unique items: ${allItems.length}`);
  console.log(`✅ Total transactions: ${allTransactions.length}`);

  return { items: allItems, transactions: allTransactions };
}

/**
 * Get all connections with their associated token files and providers
 * This allows us to disconnect specific providers
 */
export async function getAllConnections(
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
  apiBase: string = "https://api.truelayer.com"
): Promise<ConnectionInfo[]> {
  const tokenFiles = await listTokenFiles();
  const connections: ConnectionInfo[] = [];

  for (const file of tokenFiles) {
    try {
      const accessToken = await getValidAccessTokenFromFile(file, clientId, clientSecret, tokenUrl);
      const items = await listConnectedItems(accessToken, apiBase);

      if (items.length > 0) {
        const providers = [...new Set(items.map((item) => item.provider))];

        // Update token metadata with provider info
        await updateTokenMetadata(file, providers);

        connections.push({
          tokenFile: file,
          tokenFileName: file.split("/").pop() || file,
          providers,
          items,
        });
      }
    } catch (error: any) {
      console.error(`⚠️  Error processing token ${file}:`, error.message);
    }
  }

  return connections;
}

/**
 * Disconnect a specific connection by deleting its token file
 */
export async function disconnectConnection(tokenFileName: string): Promise<void> {
  const tokenFiles = await listTokenFiles();
  const file = tokenFiles.find((f) => f.endsWith(tokenFileName));

  if (!file) {
    throw new Error(`Token file not found: ${tokenFileName}`);
  }

  await deleteTokenFile(file);
  console.log(`✅ Disconnected: ${tokenFileName}`);
}
