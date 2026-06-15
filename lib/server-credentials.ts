/**
 * Server-side credential resolution.
 *
 * Every provider-backed API route resolves credentials with the same
 * precedence so behaviour is predictable and secure:
 *
 *   1. Per-request headers (Bring-Your-Own-Key) — a visitor's keys, held only
 *      in their browser and sent with the request. Never persisted server-side.
 *   2. Server environment variables — used when the owner deploys with their
 *      own keys (e.g. a private instance).
 *   3. Neither present → the route serves built-in demo data.
 *
 * Header names are intentionally explicit and namespaced.
 */

export const CREDENTIAL_HEADERS = {
  alpacaKey: "x-alpaca-key",
  alpacaSecret: "x-alpaca-secret",
  anthropicKey: "x-anthropic-key",
  crossmintKey: "x-crossmint-key",
} as const

export interface AlpacaCredentials {
  key: string
  secret: string
}

/** Resolve Alpaca credentials, or `null` to signal demo mode. */
export function resolveAlpacaCredentials(req: Request): AlpacaCredentials | null {
  const key = req.headers.get(CREDENTIAL_HEADERS.alpacaKey) || process.env.ALPACA_API_KEY
  const secret = req.headers.get(CREDENTIAL_HEADERS.alpacaSecret) || process.env.ALPACA_SECRET_KEY
  if (key && secret) return { key, secret }
  return null
}

/** Resolve an Anthropic API key, or `null` to signal demo mode. */
export function resolveAnthropicKey(req: Request): string | null {
  return req.headers.get(CREDENTIAL_HEADERS.anthropicKey) || process.env.ANTHROPIC_API_KEY || null
}

/** Resolve a Crossmint API key, or `null` to signal demo mode. */
export function resolveCrossmintKey(req: Request): string | null {
  return req.headers.get(CREDENTIAL_HEADERS.crossmintKey) || process.env.CROSSMINT_API_KEY || null
}

/** Standard Alpaca auth headers for the paper-trading REST API. */
export function alpacaHeaders(creds: AlpacaCredentials): HeadersInit {
  return {
    "APCA-API-KEY-ID": creds.key,
    "APCA-API-SECRET-KEY": creds.secret,
    "Content-Type": "application/json",
  }
}

export const ALPACA_PAPER_BASE = "https://paper-api.alpaca.markets/v2"
export const ALPACA_DATA_BASE = "https://data.alpaca.markets/v2"
