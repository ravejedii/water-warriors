"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Wallet, Activity, CheckCircle, RefreshCw, Send, ExternalLink, CloudRain, Droplets } from "lucide-react"
import { MCPContextManager } from "@/lib/mcp-context"

interface CrossmintTransaction {
  id: string
  type: "received" | "sent"
  amount: number
  from: string
  to: string
  timestamp: string
  status: "completed" | "pending" | "failed"
  txHash?: string
}

interface SubsidyProgram {
  id: string
  name: string
  description: string
  eligibleAmount: number
  status: "active" | "pending" | "completed"
  lastPayment?: string
}

export default function GovernmentSubsidy() {
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<CrossmintTransaction[]>([])
  const [subsidyPrograms, setSubsidyPrograms] = useState<SubsidyProgram[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferInProgress, setTransferInProgress] = useState(false)
  const [droughtLevel, setDroughtLevel] = useState<"high" | "medium" | "low">("medium")
  const [totalReceived, setTotalReceived] = useState<number>(0)

  const mockTransactions: CrossmintTransaction[] = [
    {
      id: "1",
      type: "received",
      amount: 15.0,
      from: "Uncle Sam (US Government)",
      to: "Farmer Ted",
      timestamp: "2024-12-05T14:30:00Z",
      status: "completed",
      txHash: "0x1234...5678",
    },
    {
      id: "2",
      type: "received",
      amount: 12.0,
      from: "Uncle Sam (US Government)",
      to: "Farmer Ted",
      timestamp: "2024-12-12T09:30:00Z",
      status: "completed",
      txHash: "0x5678...9abc",
    },
    {
      id: "3",
      type: "received",
      amount: 8.0,
      from: "Uncle Sam (US Government)",
      to: "Farmer Ted",
      timestamp: "2024-12-08T11:00:00Z",
      status: "completed",
      txHash: "0x9abc...def0",
    },
  ]

  const mockSubsidyPrograms: SubsidyProgram[] = [
    {
      id: "1",
      name: "USDA Emergency Drought Assistance",
      description: "Eligible for payments based on drought severity in your region",
      eligibleAmount: 15.0,
      status: "active",
      lastPayment: "2024-12-05",
    },
    {
      id: "2",
      name: "California Water Conservation Rebate",
      description: "USDC rewards for water efficiency improvements",
      eligibleAmount: 8.5,
      status: "active",
      lastPayment: "2024-12-08",
    },
    {
      id: "3",
      name: "Federal Crop Insurance",
      description: "Automatic USDC payouts when yield falls below 70% due to water shortage",
      eligibleAmount: 12.0,
      status: "pending",
    },
  ]

  const fetchCrossmintData = async () => {
    setIsLoading(true)
    try {
      const [balanceResponse, activityResponse] = await Promise.all([
        fetch("/api/crossmint/balance"),
        fetch("/api/crossmint/activity"),
      ])

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        // Extract USDC balance from Crossmint response
        const usdcBalance = balanceData.balances?.find((b: any) => b.token === "usdc")?.amount || 0
        setUsdcBalance(Number.parseFloat(usdcBalance))
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        // Transform Crossmint activity data to our transaction format
        const formattedTransactions =
          activityData.activities?.map((activity: any) => ({
            id: activity.id,
            type: activity.type === "receive" ? "received" : "sent",
            amount: Number.parseFloat(activity.amount),
            from: activity.from || "Unknown",
            to: activity.to || "Unknown",
            timestamp: activity.timestamp,
            status: activity.status,
            txHash: activity.transactionHash,
          })) || mockTransactions
        setTransactions(formattedTransactions)
      } else {
        setTransactions(mockTransactions)
      }

      setSubsidyPrograms(mockSubsidyPrograms)
    } catch (error) {
      console.error("Error fetching Crossmint data:", error)
      // Fallback to mock data
      setUsdcBalance(0)
      setTransactions(mockTransactions)
      setSubsidyPrograms(mockSubsidyPrograms)
    } finally {
      setIsLoading(false)
    }
  }

  const executeTransfer = async () => {
    if (!transferAmount || Number.parseFloat(transferAmount) <= 0) return

    setTransferInProgress(true)
    try {
      const response = await fetch("/api/crossmint/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number.parseFloat(transferAmount) }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Transfer successful:", result)
        // Refresh data after successful transfer
        await fetchCrossmintData()
        setTransferAmount("")
      } else {
        const error = await response.json()
        console.error("Transfer failed:", error)
      }
    } catch (error) {
      console.error("Error executing transfer:", error)
    } finally {
      setTransferInProgress(false)
    }
  }

  useEffect(() => {
    fetchCrossmintData()
    // Calculate total received from transactions
    const total = transactions
      .filter(tx => tx.type === "received" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0)
    setTotalReceived(total)
  }, [transactions])

  useEffect(() => {
    fetchCrossmintData()
  }, [])

  useEffect(() => {
    // Update MCP context with drought level
    const mcpManager = MCPContextManager.getInstance()
    mcpManager.updateCrossmintContext({
      balance: usdcBalance || 0,
      activity: transactions,
      walletAddress: "0x639A356DB809fA45A367Bc71A6D766dF2e9C6D15"
    })
    mcpManager.updateWaterFuturesContext({
      recommendations: [],
      marketData: { droughtLevel },
      weatherAlerts: droughtLevel === "high" ? ["Severe drought conditions"] : []
    })
  }, [droughtLevel, usdcBalance, transactions])

  const formatUSDC = (amount: number) => {
    return `${amount.toFixed(2)} USDC`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const totalEligibleAmount = subsidyPrograms.reduce((sum, program) => sum + program.eligibleAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Government Subsidy</h2>
          <p className="text-white/80">Ethereum Sepolia blockchain subsidy management via Crossmint</p>
        </div>
        <Button
          onClick={fetchCrossmintData}
          disabled={isLoading}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drought Level</CardTitle>
            <CloudRain className={`h-4 w-4 ${
              droughtLevel === "high" ? "text-red-400" : 
              droughtLevel === "medium" ? "text-yellow-400" : 
              "text-blue-400"
            }`} />
          </CardHeader>
          <CardContent>
            <select
              value={droughtLevel}
              onChange={(e) => setDroughtLevel(e.target.value as "high" | "medium" | "low")}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="high" className="bg-gray-800">High (75¢ subsidy)</option>
              <option value="medium" className="bg-gray-800">Medium (50¢ subsidy)</option>
              <option value="low" className="bg-gray-800">Low (25¢ subsidy)</option>
            </select>
            <p className="text-xs text-white/60 mt-2">
              {droughtLevel === "high" ? "Severe drought - $0.75 subsidy" :
               droughtLevel === "medium" ? "Moderate drought - $0.50 subsidy" :
               "Mild drought - $0.25 subsidy"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Subsidies</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatUSDC(totalEligibleAmount)}</div>
            <p className="text-xs text-white/60">Total eligible amount</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSDC(totalReceived)}</div>
            <p className="text-xs text-white/60">All-time subsidy payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border-white/20">
          <TabsTrigger value="transfer" className="text-white data-[state=active]:bg-white/20">
            Transfer
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-white/20">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="programs" className="text-white data-[state=active]:bg-white/20">
            Programs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>Execute Subsidy Transfer</CardTitle>
              <CardDescription className="text-white/60">
                Transfer USDC from Uncle Sam's wallet to Farmer Ted's wallet on Ethereum Sepolia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Transfer Amount (USDC)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter USDC amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Available Programs</Label>
                  <div className="flex flex-wrap gap-2">
                    {subsidyPrograms
                      .filter((program) => program.status === "active")
                      .map((program) => (
                        <Button
                          key={program.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setTransferAmount(program.eligibleAmount.toString())}
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs"
                        >
                          {formatUSDC(program.eligibleAmount)}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={executeTransfer}
                  disabled={transferInProgress || !transferAmount}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {transferInProgress ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing Transfer...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Execute Transfer
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-400">Wallet Information</h4>
                    <p className="text-sm text-white/80 mt-1">
                      <strong>From:</strong> Uncle Sam (US Government Crossmint Wallet)
                      <br />
                      <strong>To:</strong> Farmer Ted (0x639A356DB809fA45A367Bc71A6D766dF2e9C6D15)
                      <br />
                      <strong>Network:</strong> Ethereum Sepolia Testnet
                      <br />
                      <strong>Token:</strong> USDC
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription className="text-white/60">
                Recent USDC transfers and wallet activity on Ethereum Sepolia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {transaction.type === "received" ? (
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <Send className="h-5 w-5 text-red-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {transaction.type === "received" ? "Received" : "Sent"} {formatUSDC(transaction.amount)}
                          </p>
                          <Badge
                            variant={transaction.status === "completed" ? "default" : "secondary"}
                            className={
                              transaction.status === "completed"
                                ? "bg-green-600"
                                : transaction.status === "pending"
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/60">
                          From: {transaction.from} → To: {transaction.to}
                        </p>
                        {transaction.txHash && (
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-xs text-white/60">TX: {transaction.txHash}</p>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-white/60 hover:text-white">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">{formatDateTime(transaction.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subsidyPrograms.map((program) => (
              <Card key={program.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <CardDescription className="text-white/60 mt-1">{program.description}</CardDescription>
                    </div>
                    <Badge
                      variant={program.status === "active" ? "default" : "secondary"}
                      className={
                        program.status === "active"
                          ? "bg-green-600"
                          : program.status === "pending"
                            ? "bg-yellow-600"
                            : "bg-gray-600"
                      }
                    >
                      {program.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Eligible Amount:</span>
                      <span className="font-medium text-green-400">{formatUSDC(program.eligibleAmount)}</span>
                    </div>
                    {program.lastPayment && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Last Payment:</span>
                        <span className="font-medium">{formatDate(program.lastPayment)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Automatically processed via Crossmint on Ethereum Sepolia</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
