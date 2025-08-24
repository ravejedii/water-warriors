export interface MCPContext {
  alpaca: {
    accountInfo: any
    positions: any[]
    orders: any[]
    marketConditions: any
  }
  crossmint: {
    balance: number
    activity: any[]
    walletAddress: string
  }
  waterFutures: {
    recommendations: any[]
    marketData: any
    weatherAlerts: any[]
  }
}

export class MCPContextManager {
  private static instance: MCPContextManager
  private context: Partial<MCPContext> = {}

  static getInstance(): MCPContextManager {
    if (!MCPContextManager.instance) {
      MCPContextManager.instance = new MCPContextManager()
    }
    return MCPContextManager.instance
  }

  updateAlpacaContext(data: Partial<MCPContext["alpaca"]>) {
    this.context.alpaca = { ...this.context.alpaca, ...data }
  }

  updateCrossmintContext(data: Partial<MCPContext["crossmint"]>) {
    this.context.crossmint = { ...this.context.crossmint, ...data }
  }

  updateWaterFuturesContext(data: Partial<MCPContext["waterFutures"]>) {
    this.context.waterFutures = { ...this.context.waterFutures, ...data }
  }

  getContext(): Partial<MCPContext> {
    return this.context
  }

  getContextForClaude(): string {
    return `Current Water Futures AI Context:
    
Alpaca Trading:
- Account Balance: ${this.context.alpaca?.accountInfo?.equity || "Loading..."}
- Buying Power: ${this.context.alpaca?.accountInfo?.buying_power || "Loading..."}
- Active Positions: ${this.context.alpaca?.positions?.length || 0}
- Recent Orders: ${this.context.alpaca?.orders?.length || 0}

Crossmint Blockchain:
- USDC Balance: ${this.context.crossmint?.balance || "Loading..."} USDC
- Wallet: ${this.context.crossmint?.walletAddress || "Loading..."}
- Recent Transactions: ${this.context.crossmint?.activity?.length || 0}

Water Futures Market:
- Active Recommendations: ${this.context.waterFutures?.recommendations?.length || 0}
- Weather Alerts: ${this.context.waterFutures?.weatherAlerts?.length || 0}

You are an AI assistant specialized in water futures trading, blockchain subsidies, and market analysis. Use this context to provide informed responses about the user's current positions, market conditions, and trading opportunities.`
  }
}
