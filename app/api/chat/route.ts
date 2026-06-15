import { NextResponse } from "next/server"
import { Anthropic } from "@anthropic-ai/sdk"
import {
  ALPACA_PAPER_BASE,
  alpacaHeaders,
  resolveAlpacaCredentials,
  resolveAnthropicKey,
  resolveCrossmintKey,
  type AlpacaCredentials,
} from "@/lib/server-credentials"
import { DEMO_WALLETS, SUBSIDY_RATES, SYMBOL_ALIASES, demoAccount, type DroughtLevel } from "@/lib/demo-data"

const MODEL = "claude-opus-4-8"

const SYSTEM_PROMPT = `You are the assistant for Water Futures AI, a platform that helps farmers and \
agricultural stakeholders manage water-scarcity risk. You can explain water futures trading (NQH2O \
index), drought-based government subsidies (paid in USDC on Ethereum Sepolia via Crossmint), and the \
platform's Alpaca paper-trading integration. Keep answers concise, friendly, and grounded in the \
platform's features. If asked to trade or claim a subsidy, explain that they can type commands like \
"buy 5 AWK", "check my balance", or "claim subsidy".`

interface ChatResult {
  response: string
  demo: boolean
}

/** Place a buy order — live when Alpaca creds exist, simulated otherwise. */
async function handleBuy(quantity: number, symbol: string, creds: AlpacaCredentials | null): Promise<ChatResult> {
  const ticker = SYMBOL_ALIASES[symbol.toUpperCase()] ?? symbol.toUpperCase()

  if (!creds) {
    return {
      demo: true,
      response: `Demo order placed: **Buy ${quantity} ${ticker}** (market order, status: accepted). This is simulated demo data — add your Alpaca paper-trading keys in Settings to place real orders.`,
    }
  }

  try {
    const res = await fetch(`${ALPACA_PAPER_BASE}/orders`, {
      method: "POST",
      headers: alpacaHeaders(creds),
      body: JSON.stringify({ symbol: ticker, qty: String(quantity), side: "buy", type: "market", time_in_force: "day" }),
    })
    if (!res.ok) throw new Error(await res.text())
    const order = await res.json()
    return {
      demo: false,
      response: `Order placed: **Buy ${order.qty} ${order.symbol}** — status: ${order.status} (order ${order.id}).`,
    }
  } catch (error) {
    return { demo: false, response: `Order failed: ${error instanceof Error ? error.message : "unknown error"}.` }
  }
}

/** Report account balance — live when Alpaca creds exist, demo data otherwise. */
async function handleBalance(creds: AlpacaCredentials | null): Promise<ChatResult> {
  if (!creds) {
    return {
      demo: true,
      response: `Demo account — Portfolio value: $${demoAccount.portfolio_value.toLocaleString()}, Cash: $${demoAccount.cash.toLocaleString()}, Buying power: $${demoAccount.buying_power.toLocaleString()}. Add Alpaca keys in Settings for live data.`,
    }
  }

  try {
    const res = await fetch(`${ALPACA_PAPER_BASE}/account`, { headers: alpacaHeaders(creds) })
    if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`)
    const a = await res.json()
    return {
      demo: false,
      response: `Account — Portfolio value: $${Number(a.portfolio_value).toLocaleString()}, Cash: $${Number(a.cash).toLocaleString()}, Buying power: $${Number(a.buying_power).toLocaleString()}.`,
    }
  } catch (error) {
    return { demo: false, response: `Could not fetch balance: ${error instanceof Error ? error.message : "unknown error"}.` }
  }
}

/** Claim a drought subsidy — live when Crossmint key exists, simulated otherwise. */
async function handleSubsidy(droughtLevel: DroughtLevel, crossmintKey: string | null): Promise<ChatResult> {
  const amount = SUBSIDY_RATES[droughtLevel]

  if (!crossmintKey) {
    return {
      demo: true,
      response: `Demo subsidy claimed: **$${amount.toFixed(2)} USDC** for ${droughtLevel} drought severity, sent to Farmer Ted on Ethereum Sepolia. This is simulated — add a Crossmint key in Settings for a real transfer.`,
    }
  }

  try {
    const res = await fetch(
      "https://staging.crossmint.com/api/2025-06-09/wallets/userId:unclesam:evm/tokens/ethereum-sepolia:usdc/transfers",
      {
        method: "POST",
        headers: { "x-api-key": crossmintKey, "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: DEMO_WALLETS.farmerTed, amount: String(amount) }),
      },
    )
    const result = await res.json()
    if (!res.ok) throw new Error(result?.message || `Crossmint API error: ${res.status}`)
    return {
      demo: false,
      response: `Subsidy transferred: **$${amount.toFixed(2)} USDC** to Farmer Ted on Ethereum Sepolia (tx ${result.id ?? "pending"}).`,
    }
  } catch (error) {
    return { demo: false, response: `Subsidy transfer failed: ${error instanceof Error ? error.message : "unknown error"}.` }
  }
}

export async function POST(request: Request) {
  try {
    const { message, droughtLevel = "medium" } = await request.json()
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    const alpaca = resolveAlpacaCredentials(request)
    const crossmint = resolveCrossmintKey(request)
    const anthropicKey = resolveAnthropicKey(request)
    const lower = message.toLowerCase()

    // Intent: place a buy order.
    const buyMatch = lower.match(/buy\s+(\d+)\s+(?:shares?\s+of\s+)?([a-z]+)/)
    if (buyMatch) {
      const { response, demo } = await handleBuy(Number(buyMatch[1]), buyMatch[2], alpaca)
      return NextResponse.json({ response, demo })
    }

    // Intent: claim a drought subsidy.
    if (/(claim|send|transfer|execute).*(subsidy|subsidies)/.test(lower) || /subsidy.*(claim|now)/.test(lower)) {
      const { response, demo } = await handleSubsidy(droughtLevel as DroughtLevel, crossmint)
      return NextResponse.json({ response, demo })
    }

    // Intent: account balance.
    if (lower.includes("balance") || lower.includes("portfolio") || lower.includes("account")) {
      const { response, demo } = await handleBalance(alpaca)
      return NextResponse.json({ response, demo })
    }

    // General conversation — use Claude when a key is available, otherwise a transparent demo reply.
    if (!anthropicKey) {
      return NextResponse.json({
        demo: true,
        response:
          "I'm running in demo mode without a connected AI model, so I can answer with canned guidance only. " +
          "I can help you explore the platform: try \"buy 5 AWK\", \"check my balance\", or \"claim subsidy\". " +
          "Add your own Anthropic API key in Settings to chat with a live Claude model.",
      })
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey })
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    })
    const text = completion.content.find((b) => b.type === "text")
    return NextResponse.json({
      demo: false,
      response: text && "text" in text ? text.text : "Sorry, I couldn't generate a response.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process message" },
      { status: 500 },
    )
  }
}
