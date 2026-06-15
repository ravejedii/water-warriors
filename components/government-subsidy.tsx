"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, CloudRain, DollarSign, RefreshCw, Send, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCredentials } from "@/lib/credentials"
import { DEMO_WALLETS, SUBSIDY_RATES, type CrossmintEvent, type DroughtLevel } from "@/lib/demo-data"

const DROUGHT_OPTIONS: { value: DroughtLevel; label: string }[] = [
  { value: "high", label: "High severity" },
  { value: "medium", label: "Moderate" },
  { value: "low", label: "Mild" },
]

const usdc = (n: number) => `${n.toFixed(2)} USDC`

interface Props {
  droughtLevel: DroughtLevel
  setDroughtLevel: (level: DroughtLevel) => void
}

export default function GovernmentSubsidy({ droughtLevel, setDroughtLevel }: Props) {
  const { headers, hydrated } = useCredentials()
  const [balance, setBalance] = useState<number | null>(null)
  const [events, setEvents] = useState<CrossmintEvent[]>([])
  const [demo, setDemo] = useState(true)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [transferring, setTransferring] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const h = headers()
      const [b, a] = await Promise.all([
        fetch("/api/crossmint/balance", { headers: h }).then((r) => r.json()),
        fetch("/api/crossmint/activity", { headers: h }).then((r) => r.json()),
      ])
      setBalance(b.balanceUsdc ?? 0)
      setEvents(a.events ?? [])
      setDemo(Boolean(b.demo))
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => {
    if (hydrated) load()
  }, [hydrated, load])

  const totalReceived = events
    .filter((e) => e.to_address?.toLowerCase() === DEMO_WALLETS.farmerTed.toLowerCase())
    .reduce((sum, e) => sum + Number.parseFloat(e.amount || "0"), 0)

  const submitTransfer = async (value: number) => {
    if (!value || value <= 0) return
    setTransferring(true)
    setNotice(null)
    try {
      const res = await fetch("/api/crossmint/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({ amount: value }),
      })
      const data = await res.json()
      if (data.success) {
        setNotice(`${data.demo ? "Demo " : ""}transfer of ${usdc(value)} complete (tx ${data.transactionId}).`)
        setAmount("")
        await load()
      } else {
        setNotice(data.error ?? "Transfer failed.")
      }
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Government Subsidies</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drought-based USDC payments on Ethereum Sepolia via Crossmint.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={demo ? "secondary" : "default"}>{demo ? "Demo data" : "Live · Crossmint"}</Badge>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drought Severity</CardTitle>
            <CloudRain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {DROUGHT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setDroughtLevel(o.value)}
                  className={
                    droughtLevel === o.value
                      ? "rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                      : "rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Subsidy rate: <strong>${SUBSIDY_RATES[droughtLevel].toFixed(2)} USDC</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold">{usdc(balance ?? 0)}</div>}
            <p className="mt-1 text-xs text-muted-foreground">Farmer Ted · Sepolia</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold">{usdc(totalReceived)}</div>}
            <p className="mt-1 text-xs text-muted-foreground">All-time subsidy payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Issue a Subsidy</CardTitle>
            <CardDescription>Transfer USDC from the treasury wallet to the farmer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAmount(SUBSIDY_RATES[droughtLevel].toString())}
              >
                Use drought rate (${SUBSIDY_RATES[droughtLevel].toFixed(2)})
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={() => submitTransfer(Number.parseFloat(amount))}
              disabled={transferring || !amount}
            >
              {transferring ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send subsidy
            </Button>
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent USDC transfers on Sepolia.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {events.map((e) => {
                  const received = e.to_address?.toLowerCase() === DEMO_WALLETS.farmerTed.toLowerCase()
                  return (
                    <div key={e.transaction_hash} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            received
                              ? "flex h-9 w-9 items-center justify-center rounded-full bg-success/15 text-success"
                              : "flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive"
                          }
                        >
                          {received ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {received ? "Received" : "Sent"} {usdc(Number.parseFloat(e.amount))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {e.transaction_hash.slice(0, 8)}…{e.transaction_hash.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleDateString()}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
