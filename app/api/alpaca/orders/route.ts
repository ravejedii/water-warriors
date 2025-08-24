import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://paper-api.alpaca.markets/v2/orders?status=all&limit=50", {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`)
    }

    const orders = await response.json()

    const ordersArray = Array.isArray(orders) ? orders : []

    const formattedOrders = ordersArray.map((order: any) => ({
      id: order.id,
      client_order_id: order.client_order_id,
      created_at: order.created_at,
      updated_at: order.updated_at,
      submitted_at: order.submitted_at,
      filled_at: order.filled_at,
      expired_at: order.expired_at,
      canceled_at: order.canceled_at,
      failed_at: order.failed_at,
      replaced_at: order.replaced_at,
      replaced_by: order.replaced_by,
      replaces: order.replaces,
      asset_id: order.asset_id,
      symbol: order.symbol,
      asset_class: order.asset_class,
      notional: order.notional,
      qty: order.qty,
      filled_qty: order.filled_qty,
      filled_avg_price: order.filled_avg_price,
      order_class: order.order_class,
      order_type: order.order_type,
      type: order.type,
      side: order.side,
      time_in_force: order.time_in_force,
      limit_price: order.limit_price,
      stop_price: order.stop_price,
      status: order.status,
      extended_hours: order.extended_hours,
      legs: order.legs,
      trail_percent: order.trail_percent,
      trail_price: order.trail_price,
      hwm: order.hwm,
      commission: order.commission,
    }))

    console.log("[v0] Alpaca orders fetched:", formattedOrders.length, "orders")
    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error("Error fetching Alpaca orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders from Alpaca API" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { symbol, qty, side, type, time_in_force, limit_price } = await request.json()

    const orderRequest = {
      symbol: symbol,
      qty: qty,
      side: side,
      type: type,
      time_in_force: time_in_force || "day",
      client_order_id: `water_futures_${Date.now()}`,
      ...(limit_price && { limit_price: limit_price }),
    }

    const response = await fetch("https://paper-api.alpaca.markets/v2/orders", {
      method: "POST",
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Alpaca API error: ${response.status} - ${errorText}`)
    }

    const order = await response.json()

    console.log("[v0] Alpaca order placed:", order.id)
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error placing Alpaca order:", error)
    return NextResponse.json({ error: "Failed to place order with Alpaca API" }, { status: 500 })
  }
}
