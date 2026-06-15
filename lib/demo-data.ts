/**
 * Built-in demo dataset.
 *
 * Water Futures AI ships in Demo Mode by default so the application is fully
 * explorable without any API keys. The values below are representative samples
 * modeled on real Alpaca (paper) and Crossmint (Ethereum Sepolia) responses.
 * When a visitor supplies their own credentials, the API routes bypass this
 * data entirely and call the live providers.
 */

export interface AlpacaAccount {
  account_id: string
  cash: number
  portfolio_value: number
  buying_power: number
  equity: number
  last_equity: number
  currency: string
  status: string
}

export interface AlpacaPosition {
  symbol: string
  qty: number
  market_value: number
  unrealized_pl: number
  side: "long" | "short"
}

export interface AlpacaOrder {
  id: string
  symbol: string
  qty: number
  side: "buy" | "sell"
  order_type: string
  filled_at: string | null
  filled_avg_price: number | null
  status: string
  created_at: string
  submitted_at: string
}

export interface CrossmintEvent {
  transaction_hash: string
  from_address: string
  to_address: string
  amount: string
  timestamp: string
}

/** Wallet addresses used throughout the subsidy demo. */
export const DEMO_WALLETS = {
  uncleSam: "0x732278e9D7A02a746dcF38108dA30647CDb91217",
  farmerTed: "0x639A356DB809fA45A367Bc71A6D766dF2e9C6D15",
}

export const demoAccount: AlpacaAccount = {
  account_id: "DEMO-ACCOUNT-0001",
  cash: 96543.77,
  portfolio_value: 104218.42,
  buying_power: 196543.77,
  equity: 104218.42,
  last_equity: 103120.11,
  currency: "USD",
  status: "ACTIVE",
}

export const demoPositions: AlpacaPosition[] = [
  { symbol: "AWK", qty: 18, market_value: 2487.6, unrealized_pl: 142.3, side: "long" },
  { symbol: "XYL", qty: 25, market_value: 3210.5, unrealized_pl: -64.75, side: "long" },
  { symbol: "PHO", qty: 40, market_value: 1986.0, unrealized_pl: 88.2, side: "long" },
]

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString()

export const demoOrders: AlpacaOrder[] = [
  {
    id: "demo-ord-1001",
    symbol: "AWK",
    qty: 8,
    side: "buy",
    order_type: "market",
    filled_at: hoursAgo(3),
    filled_avg_price: 138.2,
    status: "filled",
    created_at: hoursAgo(3),
    submitted_at: hoursAgo(3),
  },
  {
    id: "demo-ord-1002",
    symbol: "XYL",
    qty: 10,
    side: "buy",
    order_type: "limit",
    filled_at: hoursAgo(26),
    filled_avg_price: 128.4,
    status: "filled",
    created_at: hoursAgo(26),
    submitted_at: hoursAgo(26),
  },
  {
    id: "demo-ord-1003",
    symbol: "PHO",
    qty: 12,
    side: "sell",
    order_type: "market",
    filled_at: hoursAgo(50),
    filled_avg_price: 49.65,
    status: "filled",
    created_at: hoursAgo(50),
    submitted_at: hoursAgo(50),
  },
]

export const demoCrossmintBalance = {
  balances: [{ token: "usdc", amount: "42.50" }],
}

const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString()

export const demoCrossmintEvents: CrossmintEvent[] = [
  {
    transaction_hash: "0x1234ab56cd78ef90123456789abcdef012345678",
    from_address: DEMO_WALLETS.uncleSam,
    to_address: DEMO_WALLETS.farmerTed,
    amount: "15.00",
    timestamp: daysAgo(2),
  },
  {
    transaction_hash: "0x5678ef90ab12cd34567890abcdef1234567890ab",
    from_address: DEMO_WALLETS.uncleSam,
    to_address: DEMO_WALLETS.farmerTed,
    amount: "12.00",
    timestamp: daysAgo(9),
  },
  {
    transaction_hash: "0x9abcdef012345678ef90ab12cd34567890abcdef",
    from_address: DEMO_WALLETS.uncleSam,
    to_address: DEMO_WALLETS.farmerTed,
    amount: "8.00",
    timestamp: daysAgo(16),
  },
]

/** Map of friendly company names to ticker symbols used by the chat agent. */
export const SYMBOL_ALIASES: Record<string, string> = {
  TESLA: "TSLA",
  AMAZON: "AMZN",
  APPLE: "AAPL",
  MICROSOFT: "MSFT",
  GOOGLE: "GOOGL",
  META: "META",
  NETFLIX: "NFLX",
}

export const SUBSIDY_RATES = { high: 0.75, medium: 0.5, low: 0.25 } as const
export type DroughtLevel = keyof typeof SUBSIDY_RATES
