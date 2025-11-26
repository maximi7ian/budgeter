/**
 * Multi-token storage for TrueLayer connections
 * Each connected bank/card gets its own token file
 */

import fs from "fs/promises";
import path from "path";

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in milliseconds
  scope: string;
  token_type: string;
  metadata?: {
    connected_at: string; // ISO timestamp when connected
    providers?: string[]; // List of provider names (e.g., ["Monzo", "American Express"])
  };
}

const TOKENS_DIR = path.join(process.cwd(), "tokens");

/**
 * Ensure tokens directory exists
 */
async function ensureTokensDir(): Promise<void> {
  try {
    await fs.mkdir(TOKENS_DIR, { recursive: true });
  } catch (err: any) {
    if (err.code !== "EEXIST") throw err;
  }
}

/**
 * List all token files in the tokens directory
 * Returns absolute paths to *.json files (excludes *.revoked)
 */
export async function listTokenFiles(): Promise<string[]> {
  await ensureTokensDir();

  try {
    const entries = await fs.readdir(TOKENS_DIR);
    const jsonFiles = entries
      .filter((name) => name.endsWith(".json") && !name.endsWith(".revoked"))
      .map((name) => path.join(TOKENS_DIR, name));
    return jsonFiles;
  } catch (err: any) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

/**
 * Load tokens from a specific file
 */
export async function loadToken(file: string): Promise<Tokens> {
  const content = await fs.readFile(file, "utf-8");
  return JSON.parse(content);
}

/**
 * Save tokens to a specific file (atomic write)
 */
export async function saveToken(file: string, tokens: Tokens): Promise<void> {
  await ensureTokensDir();

  const tempFile = `${file}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(tokens, null, 2), "utf-8");
  await fs.rename(tempFile, file);
}

/**
 * Generate a new token filename with timestamp and random suffix
 * Format: conn_yyyymmddHHMMss_<6rand>.json
 */
export function generateTokenFilename(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14); // yyyymmddHHMMss

  const random = Math.random().toString(36).substring(2, 8).padEnd(6, "0");
  const filename = `conn_${timestamp}_${random}.json`;

  return path.join(TOKENS_DIR, filename);
}

/**
 * Mark a token file as revoked (rename to *.revoked)
 */
export async function revokeToken(file: string): Promise<void> {
  const revokedPath = `${file}.revoked`;
  try {
    await fs.rename(file, revokedPath);
    console.log(`⚠️  Token marked as revoked: ${path.basename(file)}`);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}

/**
 * Delete a token file completely
 */
export async function deleteToken(file: string): Promise<void> {
  try {
    await fs.unlink(file);
    console.log(`🗑️  Token deleted: ${path.basename(file)}`);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}

/**
 * Update metadata for a token file (e.g., add provider info)
 */
export async function updateTokenMetadata(
  file: string,
  providers: string[]
): Promise<void> {
  const tokens = await loadToken(file);
  tokens.metadata = {
    connected_at: tokens.metadata?.connected_at || new Date().toISOString(),
    providers,
  };
  await saveToken(file, tokens);
}
