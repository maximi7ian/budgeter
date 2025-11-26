/**
 * TrueLayer authentication helpers
 * Handles OAuth link generation, token exchange, and token refresh
 */

import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import path from "path";
import { TokenData } from "./types";

const TOKEN_PATH = process.env.TOKEN_PATH || ".truelayer-token.json";
const TOKEN_FILE = path.join(process.cwd(), TOKEN_PATH);

/**
 * Generate TrueLayer OAuth authorization link
 */
export function generateAuthLink(
  clientId: string,
  redirectUri: string,
  scopes: string,
  authBase: string = "https://auth.truelayer.com",
  providers?: string
): string {
  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");

  const params: Record<string, string> = {
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    nonce,
  };

  // Add providers parameter if specified
  // Note: "uk-ob-all" includes both Open Banking providers AND card providers (like Amex)
  // TrueLayer's uk-ob-all filter covers all UK banks and cards, including American Express
  // If you want to limit to specific providers, set TL_PROVIDERS in .env
  if (providers) {
    params.providers = providers;
  }

  return `${authBase}/?${new URLSearchParams(params).toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokenUrl: string
): Promise<TokenData> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  try {
    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;
    const expiresAt = Date.now() + data.expires_in * 1000;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
      token_type: data.token_type || "Bearer",
    };
  } catch (error: any) {
    console.error("Token exchange error:", error.response?.data || error.message);
    throw new Error(`Failed to exchange code for token: ${error.message}`);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  tokenUrl: string
): Promise<TokenData> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  try {
    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;
    const expiresAt = Date.now() + data.expires_in * 1000;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // Some providers don't rotate refresh token
      expires_at: expiresAt,
      token_type: data.token_type || "Bearer",
    };
  } catch (error: any) {
    console.error("Token refresh error:", error.response?.data || error.message);
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
}

/**
 * Save token to file
 */
export function saveToken(token: TokenData): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));
  console.log(`✅ Token saved to ${TOKEN_PATH}`);
}

/**
 * Load token from file
 */
export function loadToken(): TokenData | null {
  if (!fs.existsSync(TOKEN_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load token:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: TokenData): boolean {
  // Consider expired 5 minutes before actual expiry
  return Date.now() >= token.expires_at - 5 * 60 * 1000;
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(
  clientId: string,
  clientSecret: string,
  tokenUrl: string
): Promise<string> {
  const token = loadToken();

  if (!token) {
    throw new Error("No token found. Please connect your banks first.");
  }

  if (isTokenExpired(token)) {
    console.log("🔄 Token expired, refreshing...");
    const newToken = await refreshToken(token.refresh_token, clientId, clientSecret, tokenUrl);
    saveToken(newToken);
    return newToken.access_token;
  }

  return token.access_token;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = loadToken();
  return token !== null;
}
