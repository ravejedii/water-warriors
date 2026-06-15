import { NextResponse } from "next/server"
import { resolveCrossmintKey } from "@/lib/server-credentials"
import { DEMO_WALLETS } from "@/lib/demo-data"

const TRANSFER_URL =
  "https://staging.crossmint.com/api/2025-06-09/wallets/userId:unclesam:evm/tokens/ethereum-sepolia:usdc/transfers"

export async function POST(request: Request) {
  const apiKey = resolveCrossmintKey(request)
  const { amount, recipient = DEMO_WALLETS.farmerTed } = await request.json()

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "A positive amount is required" }, { status: 400 })
  }

  // Demo mode: simulate a successful USDC transfer.
  if (!apiKey) {
    return NextResponse.json({
      demo: true,
      success: true,
      amount: Number(amount),
      recipient,
      transactionId: `demo-tx-${Date.now()}`,
    })
  }

  try {
    const response = await fetch(TRANSFER_URL, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount: String(amount) }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result?.message || `Crossmint API error: ${response.status}`)

    return NextResponse.json({
      demo: false,
      success: true,
      amount: Number(amount),
      recipient,
      transactionId: result.id ?? `tx-${Date.now()}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 502 },
    )
  }
}
