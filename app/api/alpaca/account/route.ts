import { NextResponse } from "next/server"
import { ALPACA_PAPER_BASE, alpacaHeaders, resolveAlpacaCredentials } from "@/lib/server-credentials"
import { demoAccount, type AlpacaAccount } from "@/lib/demo-data"

export async function GET(request: Request) {
  const creds = resolveAlpacaCredentials(request)
  if (!creds) {
    return NextResponse.json({ demo: true, account: demoAccount })
  }

  try {
    const response = await fetch(`${ALPACA_PAPER_BASE}/account`, { headers: alpacaHeaders(creds) })
    if (!response.ok) throw new Error(`Alpaca API error: ${response.status}`)
    const a = await response.json()

    const account: AlpacaAccount = {
      account_id: a.id,
      cash: Number.parseFloat(a.cash),
      portfolio_value: Number.parseFloat(a.portfolio_value),
      buying_power: Number.parseFloat(a.buying_power),
      equity: Number.parseFloat(a.equity),
      last_equity: Number.parseFloat(a.last_equity),
      currency: a.currency,
      status: a.status,
    }
    return NextResponse.json({ demo: false, account })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch account from Alpaca" },
      { status: 502 },
    )
  }
}
