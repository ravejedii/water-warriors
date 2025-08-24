"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, AlertTriangle, RefreshCw, BarChart3, Brain, Droplets, ThermometerSun } from "lucide-react"

interface PriceRecommendation {
  id: string
  contract: string
  action: "BUY" | "SELL" | "HOLD"
  currentPrice: number
  targetPrice: number
  confidence: number
  strategy: string
  reasoning: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  timeframe: string
}

interface MarketData {
  droughtIndex: number
  droughtLevel: "Normal" | "Moderate" | "Severe" | "Extreme"
  temperature: number
  precipitation: number
  reservoirLevels: number
  marketSentiment: "Bullish" | "Bearish" | "Neutral"
}

interface WeatherAlert {
  id: string
  type: "drought" | "flood" | "temperature" | "precipitation"
  severity: "LOW" | "MEDIUM" | "HIGH"
  title: string
  description: string
  impact: string
  region: string
}

export default function FuturesRecommendations() {
  const [recommendations, setRecommendations] = useState<PriceRecommendation[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const mockRecommendations: PriceRecommendation[] = [
    {
      id: "1",
      contract: "NQH25",
      action: "BUY",
      currentPrice: 498.5,
      targetPrice: 525.0,
      confidence: 87,
      strategy: "Drought Severity Hedging",
      reasoning:
        "AI models predict 23% increase in drought severity over next 30 days based on NOAA data and satellite imagery analysis.",
      riskLevel: "MEDIUM",
      timeframe: "2-4 weeks",
    },
    {
      id: "2",
      contract: "NQM25",
      action: "SELL",
      currentPrice: 512.75,
      targetPrice: 485.0,
      confidence: 72,
      strategy: "Seasonal Correction",
      reasoning:
        "Historical patterns show 15% price correction typically occurs in Q1. Current overbought conditions support this thesis.",
      riskLevel: "LOW",
      timeframe: "1-2 weeks",
    },
    {
      id: "3",
      contract: "NQU25",
      action: "HOLD",
      currentPrice: 535.25,
      targetPrice: 540.0,
      confidence: 65,
      strategy: "Range Trading",
      reasoning: "Price consolidating in $530-$545 range. Wait for clear breakout signal before taking position.",
      riskLevel: "LOW",
      timeframe: "3-5 days",
    },
  ]

  const mockMarketData: MarketData = {
    droughtIndex: 2.8,
    droughtLevel: "Moderate",
    temperature: 78.5,
    precipitation: 0.12,
    reservoirLevels: 67.3,
    marketSentiment: "Bullish",
  }

  const mockWeatherAlerts: WeatherAlert[] = [
    {
      id: "1",
      type: "drought",
      severity: "MEDIUM",
      title: "Drought Conditions Intensifying",
      description: "Central Valley showing increased drought stress indicators",
      impact: "Water futures likely to trend upward 8-12% over next month",
      region: "California Central Valley",
    },
    {
      id: "2",
      type: "temperature",
      severity: "HIGH",
      title: "Extreme Heat Wave Forecast",
      description: "Temperatures expected to exceed 105°F for 7+ consecutive days",
      impact: "Increased irrigation demand could drive prices up 15-20%",
      region: "Southwest US",
    },
    {
      id: "3",
      type: "precipitation",
      severity: "LOW",
      title: "Below Average Rainfall",
      description: "Precipitation 35% below seasonal averages",
      impact: "Moderate upward pressure on water futures pricing",
      region: "Pacific Northwest",
    },
  ]

  const fetchAIRecommendations = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Replace with actual AI model API calls
      // const aiResponse = await fetch('/api/ai/water-futures-analysis')

      setRecommendations(mockRecommendations)
      setMarketData(mockMarketData)
      setWeatherAlerts(mockWeatherAlerts)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching AI recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAIRecommendations()
  }, [])

  const getDroughtColor = (level: string) => {
    switch (level) {
      case "Normal":
        return "text-green-400 bg-green-500/20 border-green-500/30"
      case "Moderate":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
      case "Severe":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30"
      case "Extreme":
        return "text-red-400 bg-red-500/20 border-red-500/30"
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30"
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-green-600"
      case "SELL":
        return "bg-red-600"
      case "HOLD":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400"
      case "MEDIUM":
        return "text-yellow-400"
      case "HIGH":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Futures Price Recommendations</h2>
          <p className="text-white/80">AI-powered water futures trading recommendations and market analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-white/60">Last Updated</p>
            <p className="text-sm text-white">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <Button
            onClick={fetchAIRecommendations}
            disabled={isLoading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh AI Analysis
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drought Index</CardTitle>
              <Droplets className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketData.droughtIndex.toFixed(1)}</div>
              <p className={`text-xs ${getDroughtColor(marketData.droughtLevel).split(" ")[0]}`}>
                {marketData.droughtLevel} conditions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <ThermometerSun className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketData.temperature}°F</div>
              <p className="text-xs text-white/60">Regional average</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservoir Levels</CardTitle>
              <BarChart3 className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(marketData.reservoirLevels)}</div>
              <p className="text-xs text-white/60">Of capacity</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
              <Brain className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{marketData.marketSentiment}</div>
              <p className="text-xs text-white/60">AI assessment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border-white/20">
          <TabsTrigger value="recommendations" className="text-white data-[state=active]:bg-white/20">
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-white/20">
            Weather Alerts
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-white/20">
            Market Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.contract}</CardTitle>
                      <CardDescription className="text-white/60">{rec.strategy}</CardDescription>
                    </div>
                    <Badge className={getActionColor(rec.action)}>{rec.action}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/60">Current Price</p>
                      <p className="font-medium">{formatPrice(rec.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Target Price</p>
                      <p className="font-medium">{formatPrice(rec.targetPrice)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/60">Confidence</p>
                      <p className="font-medium text-green-400">{rec.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Risk Level</p>
                      <p className={`font-medium ${getRiskColor(rec.riskLevel)}`}>{rec.riskLevel}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/60 mb-1">AI Reasoning</p>
                    <p className="text-sm text-white/80">{rec.reasoning}</p>
                  </div>

                  <div className="flex justify-between text-xs text-white/60">
                    <span>Timeframe: {rec.timeframe}</span>
                    <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {weatherAlerts.map((alert) => (
              <Card key={alert.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {alert.type === "drought" && <Droplets className="h-6 w-6 text-yellow-400" />}
                      {alert.type === "temperature" && <ThermometerSun className="h-6 w-6 text-red-400" />}
                      {alert.type === "precipitation" && <AlertTriangle className="h-6 w-6 text-blue-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <Badge
                          variant="secondary"
                          className={
                            alert.severity === "HIGH"
                              ? "bg-red-600"
                              : alert.severity === "MEDIUM"
                                ? "bg-yellow-600"
                                : "bg-green-600"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-white/80 mb-3">{alert.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-white/60 mb-1">Region</p>
                          <p className="text-sm font-medium">{alert.region}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Market Impact</p>
                          <p className="text-sm font-medium text-green-400">{alert.impact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Bullish Signals
                </CardTitle>
                <CardDescription className="text-white/60">Factors supporting price increases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-sm">Drought severity increasing in key agricultural regions</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-sm">Reservoir levels 15% below seasonal averages</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-sm">Institutional buying activity increased 23%</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-sm">Climate models predict extended dry period</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Risk Factors
                </CardTitle>
                <CardDescription className="text-white/60">Potential downside risks to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <p className="text-sm">Regulatory changes in water allocation policies</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <p className="text-sm">Potential for unexpected precipitation events</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <p className="text-sm">Market volatility from speculative trading</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <p className="text-sm">Economic recession could reduce demand</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-400" />
                AI Model Performance
              </CardTitle>
              <CardDescription className="text-white/60">Recent prediction accuracy and model insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">87.3%</div>
                  <p className="text-sm text-white/60">30-day accuracy</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">92.1%</div>
                  <p className="text-sm text-white/60">7-day accuracy</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">156</div>
                  <p className="text-sm text-white/60">Data sources</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <h4 className="font-medium text-blue-400 mb-2">Model Insights</h4>
                <p className="text-sm text-white/80">
                  Our AI combines satellite imagery, weather data, reservoir levels, and market sentiment to generate
                  predictions. Recent improvements in drought pattern recognition have increased accuracy by 12% over
                  the past quarter.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
