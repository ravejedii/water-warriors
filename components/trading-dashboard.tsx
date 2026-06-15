"use client"

import { useCallback, useEffect, useState } from "react"
import { Activity, DollarSign, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCredentials } from "@/lib/credentials"
import type { AlpacaAccount, AlpacaOrder, AlpacaPosition } from "@/lib/demo-data"

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

export default function TradingDashboard() {
  const { headers, hydrated } = useCredentials()
  const [account, setAccount] = useState<AlpacaAccount | null>(null)
  const [positions, setPositions] = useState<AlpacaPosition[]>([])
  const [orders, setOrders] = useState<AlpacaOrder[]>([])
  const [demo, setDemo] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const h = headers()
      const [a, p, o] = await Promise.all([
        fetch("/api/alpaca/account", { headers: h }).then((r) => r.json()),
        fetch("/api/alpaca/positions", { headers: h }).then((r) => r.json()),
        fetch("/api/alpaca/orders", { headers: h }).then((r) => r.json()),
      ])
      if (a.error || p.error || o.error) throw new Error(a.error || p.error || o.error)
      setAccount(a.account)
      setPositions(p.positions ?? [])
      setOrders(o.orders ?? [])
      setDemo(Boolean(a.demo))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load account data.")
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => {
    if (hydrated) load()
  }, [hydrated, load])

  const stats = [
    { label: "Portfolio Value", value: account ? currency(account.portfolio_value) : "—", icon: TrendingUp, hint: "Total account value" },
    { label: "Cash", value: account ? currency(account.cash) : "—", icon: DollarSign, hint: "Available to trade" },
    { label: "Buying Power", value: account ? currency(account.buying_power) : "—", icon: Wallet, hint: "Incl. margin" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trading Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Water-sector equities via the Alpaca paper-trading API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={demo ? "secondary" : "default"}>{demo ? "Demo data" : "Live · Alpaca"}</Badge>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4 text-sm">
            <strong>Connection error:</strong> {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{s.value}</div>}
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
          <CardDescription>Open positions in your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows />
          ) : positions.length === 0 ? (
            <Empty label="No open positions" />
          ) : (
            <div className="space-y-2">
              {positions.map((p) => (
                <div key={p.symbol} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                  <div>
                    <p className="font-medium">{p.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.qty} shares · {p.side}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{currency(p.market_value)}</p>
                    <p className={p.unrealized_pl >= 0 ? "text-sm text-success" : "text-sm text-destructive"}>
                      {p.unrealized_pl >= 0 ? "+" : ""}
                      {currency(p.unrealized_pl)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest activity from the trading account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows />
          ) : orders.length === 0 ? (
            <Empty label="No recent orders" />
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                  <div className="flex items-center gap-3">
                    {o.side === "buy" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium capitalize">
                        {o.side} {o.qty} {o.symbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {o.order_type}
                        {o.filled_avg_price ? ` · @ ${currency(o.filled_avg_price)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="capitalize">
                      {o.status}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.filled_at || o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
      <Activity className="h-5 w-5" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
