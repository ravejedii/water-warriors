import { NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function GET() {
  try {
    console.log("[v0] Testing Anthropic API key...")

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("[v0] ANTHROPIC_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "ANTHROPIC_API_KEY not configured",
        },
        { status: 500 },
      )
    }

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: 'Say "Hello, the Anthropic API key is working!" in exactly those words.',
      maxTokens: 50,
    })

    console.log("[v0] Anthropic API response:", text)

    return NextResponse.json({
      success: true,
      response: text,
      message: "Anthropic API key is working correctly",
    })
  } catch (error: any) {
    console.error("[v0] Anthropic API test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
