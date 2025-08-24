import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch activity for Farmer Ted
    const farmerTedUrl = "https://staging.crossmint.com/api/unstable/wallets/userId:farmerted:evm/activity"
    
    const response = await fetch(`${farmerTedUrl}?chain=ethereum-sepolia`, {
      headers: {
        "X-API-KEY": process.env.CROSSMINT_API_KEY!,
      },
    })

    if (!response.ok) {
      // If Farmer Ted doesn't have activity, try Uncle Sam
      const uncleSamUrl = "https://staging.crossmint.com/api/unstable/wallets/userId:unclesam:evm/activity"
      
      const uncleSamResponse = await fetch(`${uncleSamUrl}?chain=ethereum-sepolia`, {
        headers: {
          "X-API-KEY": process.env.CROSSMINT_API_KEY!,
        },
      })

      if (uncleSamResponse.ok) {
        const data = await uncleSamResponse.json()
        console.log("[Crossmint Activity] Uncle Sam activity:", data)
        return NextResponse.json(data)
      }

      // Return empty activity if both fail
      console.log("[Crossmint Activity] No activity found, returning empty")
      return NextResponse.json({ activities: [] })
    }

    const data = await response.json()
    console.log("[Crossmint Activity] Farmer Ted activity:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Crossmint activity:", error)
    return NextResponse.json({ activities: [] })
  }
}