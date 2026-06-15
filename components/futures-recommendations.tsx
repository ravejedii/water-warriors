"use client"

import { AlertTriangle, BarChart3, Brain, CloudRain, Droplets, ThermometerSun, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart } from "@/components/ui/area-chart"

// Illustrative NQH2O index path (self-normalizing chart; not live market data).
const PRICE_TREND = [410, 422, 418, 435, 448, 442, 460, 475, 470, 488, 502, 498, 512, 505, 520, 535]

/*
  This view illustrates how the ML pipeline (see research/notebooks) surfaces
  trading signals. The figures below are representative sample outputs, clearly
  labeled as such — they are not live market data.
*/

interface Recommendation {
  contract: string
  action: "BUY" | "SELL" | "HOLD"
  current: number
  target: number
  confidence: number
  strategy: string
  reasoning: string
  risk: "LOW" | "MEDIUM" | "HIGH"
  timeframe: string
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    contract: "NQH2O · Q1",
    action: "BUY",
    current: 498.5,
    target: 525.0,
    confidence: 87,
    strategy: "Drought-severity hedge",
    reasoning: "Models project a 23% rise in drought severity over 30 days from GRIDMET indicators.",
    risk: "MEDIUM",
    timeframe: "2–4 weeks",
  },
  {
    contract: "NQH2O · Q2",
    action: "SELL",
    current: 512.75,
    target: 485.0,
    confidence: 72,
    strategy: "Seasonal correction",
    reasoning: "Historical Q1 patterns show a ~15% correction; current conditions look overbought.",
    risk: "LOW",
    timeframe: "1–2 weeks",
  },
  {
    contract: "NQH2O · Q3",
    action: "HOLD",
    current: 535.25,
    target: 540.0,
    confidence: 65,
    strategy: "Range trading",
    reasoning: "Price consolidating in the $530–$545 band; await a breakout signal.",
    risk: "LOW",
    timeframe: "3–5 days",
  },
]

const MARKET = [
  { label: "Drought Index", value: "2.8", hint: "Moderate", icon: Droplets },
  { label: "Avg. Temperature", value: "78.5°F", hint: "Regional", icon: ThermometerSun },
  { label: "Reservoir Levels", value: "67.3%", hint: "Of capacity", icon: BarChart3 },
  { label: "Sentiment", value: "Bullish", hint: "Model assessment", icon: Brain },
]

const SIGNALS = {
  bullish: [
    "Drought severity rising in key agricultural basins",
    "Reservoir levels ~15% below seasonal averages",
    "Climate models indicate an extended dry period",
  ],
  risks: [
    "Regulatory changes in water-allocation policy",
    "Unexpected precipitation events",
    "Volatility from speculative positioning",
  ],
}

const actionColor: Record<Recommendation["action"], string> = {
  BUY: "bg-success text-white",
  SELL: "bg-destructive text-white",
  HOLD: "bg-warning text-black",
}
const riskColor: Record<Recommendation["risk"], string> = {
  LOW: "text-success",
  MEDIUM: "text-warning",
  HIGH: "text-destructive",
}

export default function FuturesRecommendations() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Futures Analysis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drought-driven signals from the NQH2O prediction pipeline.
          </p>
        </div>
        <Badge variant="secondary">Illustrative sample</Badge>
      </div>

      <Card className="glass glow overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_1.5fr] md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">NQH2O Water Index</p>
            <p className="mt-1 font-display text-4xl font-bold tracking-tight text-gradient">$535.25</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-sm font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" /> +30.5% YTD
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Modeled trend from the drought-prediction pipeline.</p>
          </div>
          <div className="-mb-2">
            <AreaChart data={PRICE_TREND} height={150} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MARKET.map((m) => (
          <Card key={m.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {RECOMMENDATIONS.map((r) => (
          <Card key={r.contract} className="glass">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{r.contract}</CardTitle>
                  <CardDescription>{r.strategy}</CardDescription>
                </div>
                <Badge className={actionColor[r.action]}>{r.action}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="font-medium">${r.current.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-medium">${r.target.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-medium text-success">{r.confidence}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className={`font-medium ${riskColor[r.risk]}`}>{r.risk}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.reasoning}</p>
              <p className="text-xs text-muted-foreground">Timeframe: {r.timeframe}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-success" />
              Bullish Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {SIGNALS.bullish.map((s) => (
              <div key={s} className="flex items-center gap-2.5 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {s}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {SIGNALS.risks.map((s) => (
              <div key={s} className="flex items-center gap-2.5 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                {s}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardContent className="flex items-start gap-3 py-4 text-sm text-muted-foreground">
          <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Signals are derived from a model trained on 497 weekly NQH2O observations and 85+ GRIDMET drought
            indicators (2018–2025). See the notebook in <code>research/notebooks</code> for the full pipeline.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
