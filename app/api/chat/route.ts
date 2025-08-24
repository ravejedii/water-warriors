import { NextResponse } from "next/server"
import { generateText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { MCPContextManager } from "@/lib/mcp-context"
import { z } from "zod"

async function executeMCPTool(toolName: string, parameters: any) {
  try {
    switch (toolName) {
      case "get_account_info":
        const accountResponse = await fetch("https://paper-api.alpaca.markets/v2/account", {
          headers: {
            "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
            "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
          },
        })
        return await accountResponse.json()

      case "get_positions":
        const positionsResponse = await fetch("https://paper-api.alpaca.markets/v2/positions", {
          headers: {
            "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
            "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
          },
        })
        const positions = await positionsResponse.json()
        return Array.isArray(positions) ? positions : []

      case "place_stock_order":
        const orderData = {
          symbol: parameters.symbol,
          qty: parameters.quantity,
          side: parameters.side,
          type: parameters.order_type,
          time_in_force: "day",
          ...(parameters.order_type === "limit" && { limit_price: parameters.limit_price }),
        }

        const orderResponse = await fetch("https://paper-api.alpaca.markets/v2/orders", {
          method: "POST",
          headers: {
            "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
            "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        })
        return await orderResponse.json()

      case "get_stock_quote":
        const quoteResponse = await fetch(`https://data.alpaca.markets/v2/stocks/${parameters.symbol}/quotes/latest`, {
          headers: {
            "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
            "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
          },
        })
        return await quoteResponse.json()

      case "check_subsidy_eligibility":
        const droughtIndex = Math.random() * 100
        return {
          eligible: droughtIndex > 70,
          drought_index: droughtIndex,
          farmer_id: parameters.farmer_id || "farmer_ted",
        }

      case "execute_subsidy_transfer":
        return {
          success: true,
          amount: parameters.amount,
          farmer_id: parameters.farmer_id || "farmer_ted",
          transaction_id: `tx_${Date.now()}`,
        }

      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  } catch (error) {
    console.error(`Error executing MCP tool ${toolName}:`, error)
    return { error: `Failed to execute ${toolName}` }
  }
}

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const mcpManager = MCPContextManager.getInstance()
    const mcpContext = mcpManager.getContextForClaude()

    const systemPrompt = `You are a Water Futures AI assistant with direct access to trading and subsidy tools.

CAPABILITIES:
- Execute real trades on Alpaca (stocks, options)
- Check account balances and positions
- Monitor drought conditions and subsidy eligibility  
- Execute government subsidy transfers via Crossmint
- Analyze market data and provide recommendations

AVAILABLE TOOLS:
- get_account_info(): View Alpaca account balance and buying power
- get_positions(): List all current trading positions
- place_stock_order(): Execute buy/sell orders
- get_stock_quote(): Get real-time stock quotes
- check_subsidy_eligibility(): Check drought-based subsidy eligibility
- execute_subsidy_transfer(): Transfer subsidies to eligible farmers

GUIDELINES:
- Always check account info before placing trades
- Verify subsidy eligibility before executing transfers
- Provide clear explanations of actions taken
- Focus on water futures and drought-related investments
- Be cautious with real money transactions

${mcpContext}
${context ? `Additional context: ${context}` : ""}`

    const { text, toolCalls, toolResults } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 1000,
      tools: {
        get_account_info: tool({
          description: "Get current account balance, buying power, and status from Alpaca",
          parameters: z.object({}),
          execute: async () => {
            return await executeMCPTool("get_account_info", {})
          },
        }),
        get_positions: tool({
          description: "Get all current positions in the Alpaca account",
          parameters: z.object({}),
          execute: async () => {
            return await executeMCPTool("get_positions", {})
          },
        }),
        place_stock_order: tool({
          description: "Place a stock order (buy/sell) on Alpaca",
          parameters: z.object({
            symbol: z.string().describe("Stock symbol (e.g., AAPL)"),
            side: z.enum(["buy", "sell"]).describe("Order side"),
            quantity: z.number().describe("Number of shares"),
            order_type: z.enum(["market", "limit"]).describe("Order type"),
            limit_price: z.number().optional().describe("Limit price (required for limit orders)"),
          }),
          execute: async (params) => {
            return await executeMCPTool("place_stock_order", params)
          },
        }),
        get_stock_quote: tool({
          description: "Get real-time quote for a stock symbol",
          parameters: z.object({
            symbol: z.string().describe("Stock symbol (e.g., AAPL)"),
          }),
          execute: async (params) => {
            return await executeMCPTool("get_stock_quote", params)
          },
        }),
        check_subsidy_eligibility: tool({
          description: "Check if farmer is eligible for drought subsidy based on current conditions",
          parameters: z.object({
            farmer_id: z.string().optional().describe("Farmer identifier (default: 'farmer_ted')"),
          }),
          execute: async (params) => {
            return await executeMCPTool("check_subsidy_eligibility", params)
          },
        }),
        execute_subsidy_transfer: tool({
          description: "Execute subsidy transfer from Uncle Sam to eligible farmer",
          parameters: z.object({
            amount: z.number().describe("Amount in USDC to transfer"),
            farmer_id: z.string().optional().describe("Farmer identifier (default: 'farmer_ted')"),
          }),
          execute: async (params) => {
            return await executeMCPTool("execute_subsidy_transfer", params)
          },
        }),
      },
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
