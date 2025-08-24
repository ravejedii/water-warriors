import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Testing Amazon order placement...")

    const alpacaApiKey = process.env.ALPACA_API_KEY
    const alpacaSecretKey = process.env.ALPACA_SECRET_KEY

    if (!alpacaApiKey || !alpacaSecretKey) {
      throw new Error("Alpaca API credentials not found")
    }

    const orderData = {
      symbol: "AMZN",
      qty: "1",
      side: "buy",
      type: "market",
      time_in_force: "day",
    }

    console.log("[v0] Placing order:", orderData)

    const response = await fetch("https://paper-api.alpaca.markets/v2/orders", {
      method: "POST",
      headers: {
        "APCA-API-KEY-ID": alpacaApiKey,
        "APCA-API-SECRET-KEY": alpacaSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    const result = await response.json()
    console.log("[v0] Order response:", result)

    if (!response.ok) {
      throw new Error(`Order failed: ${result.message || "Unknown error"}`)
    }

    return NextResponse.json({
      success: true,
      message: "Amazon order placed successfully",
      order: result,
    })
  } catch (error) {
    console.error("[v0] Order test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
