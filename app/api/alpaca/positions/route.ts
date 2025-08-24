import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://paper-api.alpaca.markets/v2/positions", {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`)
    }

    const positions = await response.json()

    const positionsArray = Array.isArray(positions) ? positions : []

    const formattedPositions = positionsArray.map((position: any) => ({
      asset_id: position.asset_id,
      symbol: position.symbol,
      exchange: position.exchange || "ALPACA",
      asset_class: position.asset_class,
      qty: position.qty,
      side: Number.parseFloat(position.qty) > 0 ? "long" : "short",
      market_value: position.market_value,
      cost_basis: position.cost_basis,
      unrealized_pl: position.unrealized_pl,
      unrealized_plpc: position.unrealized_plpc,
      current_price: position.current_price,
      lastday_price: position.lastday_price,
      change_today: position.change_today,
      avg_entry_price: position.avg_entry_price,
      qty_available: position.qty_available || position.qty,
    }))

    console.log("[v0] Alpaca positions fetched:", formattedPositions.length, "positions")
    return NextResponse.json(formattedPositions)
  } catch (error) {
    console.error("Error fetching Alpaca positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions from Alpaca API" }, { status: 500 })
  }
}
