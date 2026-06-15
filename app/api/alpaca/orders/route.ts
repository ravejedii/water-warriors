import { NextResponse } from "next/server"
import { ALPACA_PAPER_BASE, alpacaHeaders, resolveAlpacaCredentials } from "@/lib/server-credentials"
import { demoOrders, type AlpacaOrder } from "@/lib/demo-data"

function normalizeOrder(o: any): AlpacaOrder {
  return {
    id: o.id,
    symbol: o.symbol,
    qty: Number.parseFloat(o.qty),
    side: o.side,
    order_type: o.order_type || o.type,
    filled_at: o.filled_at,
    filled_avg_price: o.filled_avg_price ? Number.parseFloat(o.filled_avg_price) : null,
    status: o.status,
    created_at: o.created_at,
    submitted_at: o.submitted_at,
  }
}

export async function GET(request: Request) {
  const creds = resolveAlpacaCredentials(request)
  if (!creds) {
    return NextResponse.json({ demo: true, orders: demoOrders })
  }

  try {
    const response = await fetch(`${ALPACA_PAPER_BASE}/orders?status=all&limit=20`, {
      headers: alpacaHeaders(creds),
    })
    if (!response.ok) throw new Error(`Alpaca API error: ${response.status}`)
    const raw = await response.json()
    const orders = (Array.isArray(raw) ? raw : []).map(normalizeOrder)
    return NextResponse.json({ demo: false, orders })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders from Alpaca" },
      { status: 502 },
    )
  }
}

export async function POST(request: Request) {
  const creds = resolveAlpacaCredentials(request)
  const body = await request.json()
  const { symbol, qty, side = "buy", type = "market", limit_price } = body

  if (!symbol || !qty) {
    return NextResponse.json({ error: "symbol and qty are required" }, { status: 400 })
  }

  // Demo mode: simulate an accepted order without touching any broker.
  if (!creds) {
    const order: AlpacaOrder = {
      id: `demo-ord-${Date.now()}`,
      symbol: String(symbol).toUpperCase(),
      qty: Number(qty),
      side,
      order_type: type,
      filled_at: null,
      filled_avg_price: null,
      status: "accepted",
      created_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    }
    return NextResponse.json({ demo: true, order })
  }

  try {
    const response = await fetch(`${ALPACA_PAPER_BASE}/orders`, {
      method: "POST",
      headers: alpacaHeaders(creds),
      body: JSON.stringify({
        symbol: String(symbol).toUpperCase(),
        qty: String(qty),
        side,
        type,
        time_in_force: "day",
        ...(type === "limit" && limit_price ? { limit_price } : {}),
      }),
    })
    if (!response.ok) throw new Error(`Alpaca API error: ${await response.text()}`)
    const order = normalizeOrder(await response.json())
    return NextResponse.json({ demo: false, order })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to place order with Alpaca" },
      { status: 502 },
    )
  }
}
