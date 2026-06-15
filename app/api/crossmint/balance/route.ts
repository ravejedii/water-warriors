import { NextResponse } from "next/server"
import { resolveCrossmintKey } from "@/lib/server-credentials"
import { DEMO_WALLETS, demoCrossmintBalance } from "@/lib/demo-data"

const CROSSMINT_BASE = "https://staging.crossmint.com/api/2025-06-09"

export async function GET(request: Request) {
  const apiKey = resolveCrossmintKey(request)
  if (!apiKey) {
    const usdc = demoCrossmintBalance.balances.find((b) => b.token === "usdc")?.amount ?? "0"
    return NextResponse.json({ demo: true, balanceUsdc: Number.parseFloat(usdc) })
  }

  try {
    const url = `${CROSSMINT_BASE}/wallets/${DEMO_WALLETS.farmerTed}/tokens?chains=ethereum-sepolia`
    const response = await fetch(url, { headers: { "x-api-key": apiKey } })
    if (!response.ok) throw new Error(`Crossmint API error: ${response.status}`)
    const data = await response.json()
    const usdc = data?.balances?.find((b: any) => b.token === "usdc")?.amount ?? "0"
    return NextResponse.json({ demo: false, balanceUsdc: Number.parseFloat(usdc) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Crossmint balance" },
      { status: 502 },
    )
  }
}
