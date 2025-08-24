"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Play, Pause } from "lucide-react"
import { MCPContextManager } from "@/lib/mcp-context"

interface AlpacaPosition {
  symbol: string
  qty: number
  market_value: number
  unrealized_pl: number
  side: "long" | "short"
}

interface AlpacaOrder {
  id: string
  symbol: string
  qty: number
  side: "buy" | "sell"
  order_type: string
  filled_at: string
  filled_avg_price: number
  status: string
  created_at: string
  submitted_at: string
}

export default function TradingDashboard() {
  const [accountBalance, setAccountBalance] = useState<number | null>(null)
  const [positions, setPositions] = useState<AlpacaPosition[]>([])
  const [recentOrders, setRecentOrders] = useState<AlpacaOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAlpacaData = async () => {
    setIsLoading(true)
    setConnectionStatus("connecting")
    setError(null)

    try {
      const [accountResponse, positionsResponse, ordersResponse] = await Promise.all([
        fetch("/api/alpaca/account"),
        fetch("/api/alpaca/positions"),
        fetch("/api/alpaca/orders"),
      ])

      if (accountResponse.ok && positionsResponse.ok && ordersResponse.ok) {
        const accountData = await accountResponse.json()
        const positionsData = await positionsResponse.json()
        const ordersData = await ordersResponse.json()

        console.log("[v0] Real Alpaca data loaded successfully")
        console.log("[v0] Orders data received:", ordersData)

        setAccountInfo(accountData)
        setAccountBalance(accountData.equity || accountData.portfolio_value || 0)
        setPositions(positionsData.positions || [])
        setRecentOrders(Array.isArray(ordersData) ? ordersData : [])
        setConnectionStatus("connected")

        const mcpManager = MCPContextManager.getInstance()
        mcpManager.updateAlpacaContext({
          accountInfo: accountData,
          positions: positionsData.positions || [],
          orders: Array.isArray(ordersData) ? ordersData : [],
          marketConditions: {
            autoTradingEnabled,
            connectionStatus: "connected",
            lastUpdate: new Date().toISOString(),
          },
        })
      } else {
        const errorMsg = "Failed to connect to Alpaca API. Please check your API credentials."
        setError(errorMsg)
        setConnectionStatus("disconnected")
        console.error("[v0] Alpaca API connection failed")
      }
    } catch (error) {
      console.error("[v0] Error fetching Alpaca data:", error)
      setError("Network error connecting to Alpaca API")
      setConnectionStatus("disconnected")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAlpacaData()

    let interval: NodeJS.Timeout
    if (autoTradingEnabled) {
      interval = setInterval(fetchAlpacaData, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoTradingEnabled])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Trading Dashboard</h2>
          <div className="flex items-center gap-3">
            <p className="text-white/80">Real-time water futures trading powered by Alpaca</p>
            <Badge
              variant={connectionStatus === "connected" ? "default" : "secondary"}
              className={
                connectionStatus === "connected"
                  ? "bg-green-600 text-white"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-600 text-white"
                    : "bg-red-600 text-white"
              }
            >
              {connectionStatus === "connected"
                ? "Live Data"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchAlpacaData}
            disabled={isLoading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
            variant={autoTradingEnabled ? "default" : "outline"}
            className={
              autoTradingEnabled
                ? "bg-green-600 hover:bg-green-700"
                : "border-white/20 text-white hover:bg-white/10 bg-transparent"
            }
          >
            {autoTradingEnabled ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Auto Trading {autoTradingEnabled ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-600/20 backdrop-blur-md border-red-500/30 text-white">
          <CardContent className="pt-6">
            <p className="text-sm">
              <strong>Connection Error:</strong> {error}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountBalance !== null ? formatCurrency(accountBalance) : "No Data"}
            </div>
            <p className="text-xs text-white/60">
              {accountInfo?.buying_power
                ? `Buying Power: ${formatCurrency(accountInfo.buying_power)}`
                : "Connect to Alpaca for live data"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Available</CardTitle>
            <DollarSign className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountInfo?.cash ? formatCurrency(accountInfo.cash) : "No Data"}</div>
            <p className="text-xs text-white/60">Available cash for trading</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountInfo?.portfolio_value ? formatCurrency(accountInfo.portfolio_value) : "No Data"}
            </div>
            <p className="text-xs text-white/60">Total portfolio value</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
          <CardDescription className="text-white/60">Active trading positions from Alpaca</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionStatus === "connected" ? (
            positions.length > 0 ? (
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{position.symbol}</p>
                        <p className="text-sm text-white/60">
                          {position.qty} shares • {position.side}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(position.market_value)}</p>
                      <p className={`text-sm ${position.unrealized_pl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {position.unrealized_pl >= 0 ? "+" : ""}
                        {formatCurrency(position.unrealized_pl)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-8">No active positions</p>
            )
          ) : (
            <p className="text-white/60 text-center py-8">Connect to Alpaca to view positions</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription className="text-white/60">Latest transactions from Alpaca</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionStatus === "connected" ? (
            recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      {order.side === "buy" ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {order.side === "buy" ? "Buy" : "Sell"} {order.qty} {order.symbol}
                          </p>
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/60">
                          {order.filled_avg_price
                            ? `@ ${formatCurrency(order.filled_avg_price)} | ${order.order_type}`
                            : `${order.order_type} order`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${order.side === "buy" ? "text-red-400" : "text-green-400"}`}>
                        {order.filled_avg_price
                          ? `${order.side === "buy" ? "-" : "+"}${formatCurrency(order.qty * order.filled_avg_price)}`
                          : `${order.qty} shares`}
                      </p>
                      <p className="text-sm text-white/60">
                        {formatDate(order.filled_at || order.created_at || order.submitted_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-8">No recent orders</p>
            )
          ) : (
            <p className="text-white/60 text-center py-8">Connect to Alpaca to view orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
