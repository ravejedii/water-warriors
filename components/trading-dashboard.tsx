"use client"

import { useCallback, useEffect, useState } from "react"
import { Activity, ArrowDownRight, ArrowUpRight, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart } from "@/components/ui/area-chart"
import { useCredentials } from "@/lib/credentials"
import type { AlpacaAccount, AlpacaOrder, AlpacaPosition } from "@/lib/demo-data"

const currency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

// Illustrative equity-curve shape (the chart self-normalizes; values aren't a live series).
const TREND = [0.42, 0.45, 0.4, 0.5, 0.47, 0.55, 0.52, 0.61, 0.57, 0.65, 0.62, 0.71, 0.68, 0.66, 0.75, 0.73, 0.82, 0.79, 0.86, 0.83, 0.91, 0.88, 0.96, 1]

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

  const dayPL = account ? account.equity - account.last_equity : 0
  const dayPLPct = account && account.last_equity ? (dayPL / account.last_equity) * 100 : 0
  const up = dayPL >= 0

  return (
    <div className="space-y-6">
      <Header
        title="Trading Dashboard"
        subtitle="Water-sector equities via the Alpaca paper-trading API."
        demo={demo}
        live="Live · Alpaca"
        loading={loading}
        onRefresh={load}
      />

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4 text-sm">
            <strong>Connection error:</strong> {error}
          </CardContent>
        </Card>
      )}

      {/* Hero: portfolio value + trend */}
      <Card className="glass glow overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            {loading ? (
              <Skeleton className="mt-2 h-11 w-48" />
            ) : (
              <p className="mt-1 font-display text-4xl font-bold tracking-tight text-gradient">
                {account ? currency(account.portfolio_value) : "—"}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className={
                  up
                    ? "inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-medium text-success"
                    : "inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 font-medium text-destructive"
                }
              >
                {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {up ? "+" : ""}
                {currency(dayPL)} ({dayPLPct.toFixed(2)}%)
              </span>
              <span className="text-muted-foreground">today</span>
            </div>
          </div>
          <div className="-mb-2">
            <AreaChart data={TREND} height={140} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Cash" value={account ? currency(account.cash) : "—"} hint="Available to trade" loading={loading} />
        <Stat label="Buying Power" value={account ? currency(account.buying_power) : "—"} hint="Incl. margin" loading={loading} />
        <Stat label="Equity" value={account ? currency(account.equity) : "—"} hint="Marked to market" loading={loading} />
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Current Positions</CardTitle>
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
                <Row key={p.symbol}>
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
                </Row>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
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
                <Row key={o.id}>
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        o.side === "buy"
                          ? "flex h-9 w-9 items-center justify-center rounded-full bg-success/12 text-success"
                          : "flex h-9 w-9 items-center justify-center rounded-full bg-destructive/12 text-destructive"
                      }
                    >
                      {o.side === "buy" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
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
                </Row>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function Header({
  title,
  subtitle,
  demo,
  live,
  loading,
  onRefresh,
  extra,
}: {
  title: string
  subtitle: string
  demo: boolean
  live: string
  loading: boolean
  onRefresh: () => void
  extra?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <Badge variant={demo ? "secondary" : "default"}>{demo ? "Demo data" : live}</Badge>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refresh
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value, hint, loading }: { label: string; value: string; hint: string; loading: boolean }) {
  return (
    <Card className="glass transition-transform duration-200 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-2 h-7 w-28" /> : <p className="mt-1 font-display text-2xl font-semibold">{value}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3 transition-colors hover:border-primary/30">
      {children}
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
