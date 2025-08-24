import { spawn, type ChildProcess } from "child_process"

interface MCPMessage {
  jsonrpc: string
  id?: string | number
  method?: string
  params?: any
  result?: any
  error?: any
}

interface AlpacaTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

export class AlpacaMCPClient {
  private process: ChildProcess | null = null
  private messageId = 0
  private pendingRequests = new Map<string | number, (response: MCPMessage) => void>()
  private tools: AlpacaTool[] = []
  private isConnected = false

  constructor(
    private pythonPath = "python",
    private serverPath = "./scripts/alpaca_mcp_server.py",
  ) {}

  async connect(): Promise<void> {
    if (this.isConnected) return

    return new Promise((resolve, reject) => {
      try {
        // Start the Alpaca MCP server process
        this.process = spawn(this.pythonPath, [this.serverPath], {
          stdio: ["pipe", "pipe", "pipe"],
          env: {
            ...process.env,
            ALPACA_API_KEY: process.env.ALPACA_API_KEY,
            ALPACA_SECRET_KEY: process.env.ALPACA_SECRET_KEY,
            ALPACA_PAPER_TRADE: "True",
          },
        })

        if (!this.process.stdout || !this.process.stdin) {
          throw new Error("Failed to create MCP server process")
        }

        // Handle incoming messages
        let buffer = ""
        this.process.stdout.on("data", (data) => {
          buffer += data.toString()
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.trim()) {
              try {
                const message: MCPMessage = JSON.parse(line)
                this.handleMessage(message)
              } catch (error) {
                console.error("Failed to parse MCP message:", error)
              }
            }
          }
        })

        this.process.stderr?.on("data", (data) => {
          console.error("MCP Server Error:", data.toString())
        })

        this.process.on("close", (code) => {
          console.log(`MCP server process exited with code ${code}`)
          this.isConnected = false
        })

        // Initialize the connection
        this.sendMessage({
          jsonrpc: "2.0",
          id: this.getNextId(),
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            clientInfo: {
              name: "water-futures-ai",
              version: "1.0.0",
            },
          },
        })

        // Wait for initialization
        setTimeout(() => {
          this.isConnected = true
          this.loadTools()
            .then(() => resolve())
            .catch(reject)
        }, 1000)
      } catch (error) {
        reject(error)
      }
    })
  }

  private async loadTools(): Promise<void> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/list",
    })

    if (response.result?.tools) {
      this.tools = response.result.tools
    }
  }

  private handleMessage(message: MCPMessage): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      const resolver = this.pendingRequests.get(message.id)!
      resolver(message)
      this.pendingRequests.delete(message.id)
    }
  }

  private sendMessage(message: MCPMessage): void {
    if (!this.process?.stdin) {
      throw new Error("MCP server not connected")
    }

    const messageStr = JSON.stringify(message) + "\n"
    this.process.stdin.write(messageStr)
  }

  private sendRequest(message: MCPMessage): Promise<MCPMessage> {
    return new Promise((resolve) => {
      if (message.id) {
        this.pendingRequests.set(message.id, resolve)
      }
      this.sendMessage(message)
    })
  }

  private getNextId(): number {
    return ++this.messageId
  }

  async getAccountInfo(): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/call",
      params: {
        name: "get_account_info",
        arguments: {},
      },
    })

    return response.result?.content?.[0]?.text || response.result
  }

  async getPositions(): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/call",
      params: {
        name: "get_positions",
        arguments: {},
      },
    })

    return response.result?.content?.[0]?.text || response.result
  }

  async placeStockOrder(params: {
    symbol: string
    side: "buy" | "sell"
    quantity: number
    order_type?: "market" | "limit"
    limit_price?: number
  }): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/call",
      params: {
        name: "place_stock_order",
        arguments: params,
      },
    })

    return response.result?.content?.[0]?.text || response.result
  }

  async getStockQuote(symbol: string): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/call",
      params: {
        name: "get_stock_quote",
        arguments: { symbol },
      },
    })

    return response.result?.content?.[0]?.text || response.result
  }

  async getOrders(status?: string, limit?: number): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/call",
      params: {
        name: "get_orders",
        arguments: { status, limit },
      },
    })

    return response.result?.content?.[0]?.text || response.result
  }

  async getMarketClock(): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.getNextId(),
      method: "tools/call",
      params: {
        name: "get_market_clock",
        arguments: {},
      },
    })

    return response.result?.content?.[0]?.text || response.result
  }

  getAvailableTools(): AlpacaTool[] {
    return this.tools
  }

  isReady(): boolean {
    return this.isConnected
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill()
      this.process = null
      this.isConnected = false
    }
  }
}

// Singleton instance
let mcpClient: AlpacaMCPClient | null = null

export function getAlpacaMCPClient(): AlpacaMCPClient {
  if (!mcpClient) {
    mcpClient = new AlpacaMCPClient()
  }
  return mcpClient
}
