import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { symbol, quantity } = await request.json()

    const orderData = {
      symbol: symbol.toUpperCase(),
      qty: quantity.toString(),
      side: "buy",
      type: "market",
      time_in_force: "day"
    }

    console.log("[Test Order API] Placing order:", orderData)

    const orderResponse = await fetch("https://paper-api.alpaca.markets/v2/orders", {
      method: "POST",
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      console.error("[Test Order API] Order failed:", errorText)
      throw new Error(`Order failed: ${errorText}`)
    }
    
    const order = await orderResponse.json()
    console.log("[Test Order API] Order placed successfully:", order)
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        qty: order.qty,
        type: order.order_type,
        status: order.status,
        submitted_at: order.submitted_at
      }
    })
  } catch (error) {
    console.error("Error in test order API:", error)
    return NextResponse.json({ 
      error: "Failed to place order",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}