import { NextResponse } from "next/server"
import { Anthropic } from '@anthropic-ai/sdk'

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

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("[Simple Chat API] Processing message:", message)

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
      const systemPrompt = `You are a helpful trading assistant for water futures and stocks. 
        You can help users buy stocks by saying things like "buy 1 tesla" or "buy 5 shares of apple".
        You can also check account balances. Keep responses concise and helpful.`

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
        : 'I can help you buy stocks. Try saying "buy 1 tesla" or "check my balance".'
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