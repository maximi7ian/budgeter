/**
 * Google Sheets integration
 * Fetches excluded expenses data from a Google Sheet
 */

import { google } from "googleapis";
import fs from "fs";
import { ExcludedExpenseRow } from "./types";

/**
 * Parse DD/MM/YYYY date to YYYY-MM-DD
 */
function parseDDMMYYYY(dateStr: string): string {
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [day, month, year] = parts;
  const yyyy = year.length === 2 ? `20${year}` : year;
  const mm = month.padStart(2, "0");
  const dd = day.padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse amount string (e.g., "£123.45", "-£50.00", "100") to number
 */
function parseAmount(amount: string | number): number {
  if (typeof amount === "number") {
    return amount;
  }

  // Remove £, $, commas, spaces
  let cleaned = amount.replace(/[£$,\s]/g, "");

  // Handle parentheses as negative (accounting format)
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = "-" + cleaned.substring(1, cleaned.length - 1);
  }

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    throw new Error(`Could not parse amount: ${amount}`);
  }

  return Math.abs(parsed); // Always positive for excluded expenses
}

/**
 * Parse boolean value
 */
function parseBoolean(value: string | boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = value.toString().toLowerCase().trim();
  return normalized === "true" || normalized === "yes" || normalized === "1";
}

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credPath || !fs.existsSync(credPath)) {
    throw new Error(
      `Google credentials file not found at: ${credPath}. ` +
        `Please download service account JSON and set GOOGLE_APPLICATION_CREDENTIALS in .env`
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient as any });

  return sheets;
}

/**
 * Fetch excluded expenses from Google Sheet
 */
export async function fetchExcludedExpenses(): Promise<ExcludedExpenseRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || "Excluded Expenses!A:D";

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID not set in .env");
  }

  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log("No data found in Google Sheet");
      return [];
    }

    // Skip header row
    const dataRows = rows.slice(1);
    const excludedExpenses: ExcludedExpenseRow[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      try {
        // Expected columns: Date | Vendor | Amount | Note (optional)
        const dateStr = row[0]?.toString().trim() || "";
        const vendor = row[1]?.toString().trim() || "";
        const amountStr = row[2]?.toString().trim() || "";
        const note = row[3]?.toString().trim(); // Optional

        if (!dateStr || !vendor || !amountStr) {
          console.warn(`Row ${i + 2}: Missing required fields (Date, Vendor, Amount), skipping`);
          continue;
        }

        const dateISO = parseDDMMYYYY(dateStr);
        const amountGBP = parseAmount(amountStr);

        const expense: ExcludedExpenseRow = {
          dateISO,
          vendor,
          amountGBP,
        };

        // Only add note if it exists and is not empty
        if (note && note.length > 0) {
          expense.note = note;
        }

        excludedExpenses.push(expense);
      } catch (error: any) {
        console.warn(`Row ${i + 2}: Parse error - ${error.message}, skipping`);
        continue;
      }
    }

    console.log(`✅ Loaded ${excludedExpenses.length} excluded expenses from Google Sheets`);
    return excludedExpenses;
  } catch (error: any) {
    const errorCode = error.code || error.response?.status;
    console.error("Google Sheets API error:", error.message);

    if (errorCode === 403) {
      throw new Error(
        `Failed to read Google Sheets: Permission denied (403). ` +
          `Please share the sheet with your service account email. ` +
          `Find the email in your ${process.env.GOOGLE_APPLICATION_CREDENTIALS} file (client_email field).`
      );
    } else if (errorCode === 404) {
      throw new Error(
        `Failed to read Google Sheets: Spreadsheet not found (404). ` +
          `Check that GOOGLE_SHEETS_SPREADSHEET_ID is correct: ${spreadsheetId}`
      );
    }

    throw new Error(`Failed to read Google Sheets: ${error.message}`);
  }
}

/**
 * Check if Google Sheets is configured
 */
export function isSheetsConfigured(): boolean {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  return !!(spreadsheetId && credPath && fs.existsSync(credPath));
}

/**
 * Get dummy excluded expenses for testing
 */
export function getDummyExcludedExpenses(): ExcludedExpenseRow[] {
  return [
    {
      dateISO: "2025-10-23",
      vendor: "British Airways",
      amountGBP: 901.82,
      note: "Flights to and from Cape Town",
    },
    {
      dateISO: "2025-10-15",
      vendor: "Premier Inn",
      amountGBP: 250.0,
      note: "Hotel for client meeting",
    },
  ];
}
