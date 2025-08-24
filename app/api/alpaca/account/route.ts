import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://paper-api.alpaca.markets/v2/account", {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`)
    }

    const account = await response.json()

    const accountData = {
      account_id: account.id,
      cash: Number.parseFloat(account.cash),
      portfolio_value: Number.parseFloat(account.portfolio_value),
      buying_power: Number.parseFloat(account.buying_power),
      equity: Number.parseFloat(account.equity),
      last_equity: Number.parseFloat(account.last_equity),
      multiplier: Number.parseInt(account.multiplier),
      currency: account.currency,
      status: account.status,
      pattern_day_trader: account.pattern_day_trader,
      trading_blocked: account.trading_blocked,
      transfers_blocked: account.transfers_blocked,
      account_blocked: account.account_blocked,
      created_at: account.created_at,
      trade_suspended_by_user: account.trade_suspended_by_user,
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Alpaca account data fetched:", accountData)
    return NextResponse.json(accountData)
  } catch (error) {
    console.error("Error fetching Alpaca account data:", error)
    return NextResponse.json({ error: "Failed to fetch account data from Alpaca API" }, { status: 500 })
  }
}
