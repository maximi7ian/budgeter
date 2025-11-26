/**
 * Token management for multi-token store
 * Handles refresh and validation for individual token files
 */

import axios from "axios";
import { Tokens, loadToken, saveToken, revokeToken } from "./tokenStore";

/**
 * Check if token is expired or expiring soon (within 5 minutes)
 */
function isTokenExpiringSoon(tokens: Tokens): boolean {
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= tokens.expires_at - fiveMinutes;
}

/**
 * Refresh tokens for a specific token file
 * Returns updated tokens with new expiry and potentially new refresh_token
 */
export async function refreshTokens(
  file: string,
  clientId: string,
  clientSecret: string,
  tokenUrl: string
): Promise<Tokens> {
  const tokens = await loadToken(file);

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: tokens.refresh_token,
  });

  try {
    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;
    const expiresAt = Date.now() + data.expires_in * 1000;

    const updatedTokens: Tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token, // Use new refresh_token if rotated
      expires_at: expiresAt,
      scope: data.scope || tokens.scope,
      token_type: data.token_type || "Bearer",
    };

    // Save updated tokens back to the same file
    await saveToken(file, updatedTokens);
    console.log(`✅ Token refreshed: ${file}`);

    return updatedTokens;
  } catch (error: any) {
    const errorData = error.response?.data;

    // Handle invalid_grant (revoked or expired refresh token)
    if (errorData?.error === "invalid_grant") {
      console.error(`⚠️  Token refresh failed (invalid_grant): ${file}`);
      await revokeToken(file);
      throw new Error("Token revoked - needs reconnection");
    }

    console.error("Token refresh error:", errorData || error.message);
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
}

/**
 * Get valid access token for a specific token file
 * Automatically refreshes if expiring soon
 */
export async function getValidAccessToken(
  file: string,
  clientId: string,
  clientSecret: string,
  tokenUrl: string
): Promise<string> {
  let tokens = await loadToken(file);

  if (isTokenExpiringSoon(tokens)) {
    console.log(`🔄 Token expiring soon, refreshing: ${file}`);
    tokens = await refreshTokens(file, clientId, clientSecret, tokenUrl);
  }

  return tokens.access_token;
}
