import { NextResponse } from "next/server"
import { ALPACA_PAPER_BASE, alpacaHeaders, resolveAlpacaCredentials } from "@/lib/server-credentials"
import { demoPositions, type AlpacaPosition } from "@/lib/demo-data"

export async function GET(request: Request) {
  const creds = resolveAlpacaCredentials(request)
  if (!creds) {
    return NextResponse.json({ demo: true, positions: demoPositions })
  }

  try {
    const response = await fetch(`${ALPACA_PAPER_BASE}/positions`, { headers: alpacaHeaders(creds) })
    if (!response.ok) throw new Error(`Alpaca API error: ${response.status}`)
    const raw = await response.json()

    const positions: AlpacaPosition[] = (Array.isArray(raw) ? raw : []).map((p: any) => ({
      symbol: p.symbol,
      qty: Number.parseFloat(p.qty),
      market_value: Number.parseFloat(p.market_value),
      unrealized_pl: Number.parseFloat(p.unrealized_pl),
      side: Number.parseFloat(p.qty) >= 0 ? "long" : "short",
    }))
    return NextResponse.json({ demo: false, positions })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch positions from Alpaca" },
      { status: 502 },
    )
  }
}
