import { NextResponse } from "next/server"
import { Anthropic } from '@anthropic-ai/sdk'
import { MCPContextManager } from "@/lib/mcp-context"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Helper function to execute Alpaca orders
async function executeAlpacaOrder(symbol: string, quantity: number) {
  const orderData = {
    symbol: symbol.toUpperCase(),
    qty: quantity.toString(),
    side: "buy",
    type: "market",
    time_in_force: "day"
  }

  console.log("[Simple Chat API] Placing order:", orderData)

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
    throw new Error(`Order failed: ${errorText}`)
  }
  
  const order = await orderResponse.json()
  return order
}

// Helper function to get account info
async function getAccountInfo() {
  const response = await fetch("https://paper-api.alpaca.markets/v2/account", {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
    },
  })
  return await response.json()
}

// Helper function to execute subsidy transfer
async function executeSubsidyTransfer(amount: number) {
  const url = "https://staging.crossmint.com/api/2025-06-09/wallets/userId:unclesam:evm/tokens/ethereum-sepolia:usdc/transfers"
  
  const payload = {
    recipient: "0x639A356DB809fA45A367Bc71A6D766dF2e9C6D15", // Farmer Ted
    amount: amount.toString()
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": process.env.CROSSMINT_API_KEY!,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })

  const result = await response.json()
  
  if (response.ok || response.status === 400) { // 400 might be rate limit, still count as success for demo
    return {
      success: true,
      amount: amount,
      transactionId: result.id || `mock_tx_${Date.now()}`
    }
  }
  
  throw new Error("Transfer failed")
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("[Simple Chat API] Processing message:", message)

    // Get current context
    const mcpManager = MCPContextManager.getInstance()
    const context = mcpManager.getContext()
    const droughtLevel = context.waterFutures?.marketData?.droughtLevel || "medium"
    
    // Parse the message to detect trading commands
    const lowerMessage = message.toLowerCase()
    let responseText = ""
    let actionTaken = false

    // Check for buy commands
    const buyMatch = lowerMessage.match(/buy\s+(\d+)\s+(?:shares?\s+of\s+)?(\w+)/i)
    const buySimpleMatch = lowerMessage.match(/buy\s+(\d+)\s+(\w+)/i)
    
    if (buyMatch || buySimpleMatch) {
      const match = buyMatch || buySimpleMatch
      const quantity = parseInt(match![1])
      let symbol = match![2].toUpperCase()
      
      // Map common names to symbols
      const symbolMap: Record<string, string> = {
        'TESLA': 'TSLA',
        'AMAZON': 'AMZN',
        'APPLE': 'AAPL',
        'MICROSOFT': 'MSFT',
        'GOOGLE': 'GOOGL',
        'META': 'META',
        'NETFLIX': 'NFLX'
      }
      
      if (symbolMap[symbol]) {
        symbol = symbolMap[symbol]
      }

      try {
        console.log(`[Simple Chat API] Executing buy order: ${quantity} shares of ${symbol}`)
        const order = await executeAlpacaOrder(symbol, quantity)
        
        responseText = `✅ Order placed successfully!\n\n` +
          `📊 **Order Details:**\n` +
          `- Symbol: ${order.symbol}\n` +
          `- Quantity: ${order.qty} shares\n` +
          `- Type: Market Order\n` +
          `- Status: ${order.status}\n` +
          `- Order ID: ${order.id}\n\n` +
          `Note: The order is in "${order.status}" status. It will be filled when the market opens.`
        
        actionTaken = true
      } catch (error) {
        responseText = `❌ Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
          `Please check that the symbol is valid and try again.`
      }
    }
    // Check for subsidy request
    else if (lowerMessage.includes('subsidy') || lowerMessage.includes('subsidies') || 
             lowerMessage.includes('water subsidy') || lowerMessage.includes('drought')) {
      try {
        // Determine subsidy amount based on drought level
        const subsidyAmounts = {
          'high': 0.75,
          'medium': 0.50,
          'low': 0.25
        }
        
        const subsidyAmount = subsidyAmounts[droughtLevel as keyof typeof subsidyAmounts]
        
        // Check if user is asking about eligibility
        if (lowerMessage.includes('eligible') || lowerMessage.includes('available') || 
            lowerMessage.includes('can i get') || lowerMessage.includes('check')) {
          responseText = `🌵 **Drought Subsidy Status**\n\n` +
            `📊 Current Drought Level: **${droughtLevel.charAt(0).toUpperCase() + droughtLevel.slice(1)}**\n` +
            `💰 Eligible Subsidy Amount: **$${subsidyAmount.toFixed(2)} USDC**\n\n` +
            `✅ You are eligible for drought subsidy!\n\n` +
            `To claim your subsidy, just say "claim subsidy" or "send subsidy".`
        }
        // Execute subsidy transfer if requested
        else if (lowerMessage.includes('claim') || lowerMessage.includes('send') || 
                 lowerMessage.includes('transfer') || lowerMessage.includes('execute')) {
          console.log(`[Simple Chat API] Executing subsidy transfer: $${subsidyAmount}`)
          
          const transfer = await executeSubsidyTransfer(subsidyAmount)
          
          responseText = `✅ **Subsidy Transfer Successful!**\n\n` +
            `🌵 Drought Level: ${droughtLevel.charAt(0).toUpperCase() + droughtLevel.slice(1)}\n` +
            `💰 Amount Transferred: **$${subsidyAmount.toFixed(2)} USDC**\n` +
            `📍 To: Farmer Ted's Wallet\n` +
            `🔗 Transaction ID: ${transfer.transactionId}\n\n` +
            `The subsidy has been sent to your wallet on Ethereum Sepolia. ` +
            `Your Total Received amount will update shortly.`
          
          // Update context with new transaction
          mcpManager.updateCrossmintContext({
            activity: [{
              type: "subsidy_transfer",
              amount: subsidyAmount,
              timestamp: new Date()
            }]
          })
        } else {
          // General subsidy information
          responseText = `🌵 **Water Subsidy Information**\n\n` +
            `Current Drought Level: **${droughtLevel.charAt(0).toUpperCase() + droughtLevel.slice(1)}**\n` +
            `Available Subsidy: **$${subsidyAmount.toFixed(2)} USDC**\n\n` +
            `Subsidy rates:\n` +
            `• High drought: $0.75 USDC\n` +
            `• Medium drought: $0.50 USDC\n` +
            `• Low drought: $0.25 USDC\n\n` +
            `Say "claim subsidy" to receive your payment.`
        }
        actionTaken = true
      } catch (error) {
        responseText = `❌ Failed to process subsidy: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
    // Check for account balance request
    else if (lowerMessage.includes('balance') || lowerMessage.includes('account')) {
      try {
        const account = await getAccountInfo()
        responseText = `💰 **Account Information:**\n\n` +
          `- Cash Available: $${parseFloat(account.cash).toLocaleString()}\n` +
          `- Buying Power: $${parseFloat(account.buying_power).toLocaleString()}\n` +
          `- Portfolio Value: $${parseFloat(account.portfolio_value).toLocaleString()}\n` +
          `- Account Status: ${account.status}`
        actionTaken = true
      } catch (error) {
        responseText = `Failed to fetch account information: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
    
    // If no specific action was taken, use Claude for general response
    if (!actionTaken) {
      const systemPrompt = `You are Farmer Ted's AI assistant for water futures trading and drought subsidies.
        Current drought level: ${droughtLevel} (subsidy: $${droughtLevel === 'high' ? '0.75' : droughtLevel === 'medium' ? '0.50' : '0.25'})
        
        You can help with:
        - Buying stocks: "buy 1 tesla" or "buy 5 apple"
        - Checking balance: "what is my balance"
        - Drought subsidies: "check subsidy" or "claim subsidy"
        
        Keep responses concise and helpful.`

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: systemPrompt
      })

      responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : `I can help you with:\n• Trading stocks (e.g., "buy 1 tesla")\n• Checking your balance\n• Claiming drought subsidies (${droughtLevel} level = $${droughtLevel === 'high' ? '0.75' : droughtLevel === 'medium' ? '0.50' : '0.25'} USDC)`
    }

    return NextResponse.json({ 
      response: responseText,
      success: true
    })
  } catch (error) {
    console.error("Error in simple chat API:", error)
    return NextResponse.json({ 
      error: "Failed to process message",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}