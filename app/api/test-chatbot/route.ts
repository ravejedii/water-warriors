export async function POST() {
  try {
    console.log("[v0] Testing chatbot functionality...")

    // Test the chat API with a simple trading request
    const response = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Buy 1 share of Amazon (AMZN)",
          context: "Water Futures AI Platform - Trading Dashboard",
        }),
      },
    )

    console.log("[v0] Chat API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Chat API error:", errorText)
      return Response.json(
        {
          success: false,
          error: `Chat API failed with status ${response.status}: ${errorText}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("[v0] Chat API response:", data)

    return Response.json({
      success: true,
      message: "Chatbot test completed successfully",
      response: data.response,
    })
  } catch (error) {
    console.error("[v0] Chatbot test error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
