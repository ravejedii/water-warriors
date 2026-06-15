import { NextResponse } from "next/server"
import { resolveCrossmintKey } from "@/lib/server-credentials"
import { type CrossmintEvent, demoCrossmintEvents } from "@/lib/demo-data"

const CROSSMINT_ACTIVITY_URL =
  "https://staging.crossmint.com/api/unstable/wallets/userId:farmerted:evm/activity?chain=ethereum-sepolia"

export async function GET(request: Request) {
  const apiKey = resolveCrossmintKey(request)
  if (!apiKey) {
    return NextResponse.json({ demo: true, events: demoCrossmintEvents })
  }

  try {
    const response = await fetch(CROSSMINT_ACTIVITY_URL, { headers: { "X-API-KEY": apiKey } })
    if (!response.ok) throw new Error(`Crossmint API error: ${response.status}`)
    const data = await response.json()

    const events: CrossmintEvent[] = (data?.events ?? []).map((e: any) => ({
      transaction_hash: e.transaction_hash,
      from_address: e.from_address,
      to_address: e.to_address,
      amount: e.amount ?? "0",
      timestamp: e.timestamp,
    }))
    return NextResponse.json({ demo: false, events })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Crossmint activity" },
      { status: 502 },
    )
  }
}
