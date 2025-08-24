"use client"

import { useState } from "react"
import { Menu, X, Droplets, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import TradingDashboard from "@/components/trading-dashboard"
import GovernmentSubsidy from "@/components/government-subsidy"
import FuturesRecommendations from "@/components/futures-recommendations"
import ChatBot from "@/components/chatbot"

export default function WaterFuturesAI() {
  const [activeTab, setActiveTab] = useState("trading")
  const [menuOpen, setMenuOpen] = useState(false)

  const tabs = [
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "subsidy", label: "Government Subsidy", icon: DollarSign },
    { id: "futures", label: "Futures Recommendations", icon: Droplets },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "trading":
        return <TradingDashboard />
      case "subsidy":
        return <GovernmentSubsidy />
      case "futures":
        return <FuturesRecommendations />
      default:
        return <TradingDashboard />
    }
  }

  const getChatbotContext = () => {
    switch (activeTab) {
      case "trading":
        return "User is currently viewing the Trading Dashboard with Alpaca integration, account balances, positions, and order history."
      case "subsidy":
        return "User is currently viewing the Government Subsidy system with Ethereum Sepolia blockchain transactions via Crossmint, including balance checking and transfer execution."
      case "futures":
        return "User is currently viewing the Futures Price Recommendations with AI-powered analysis, drought monitoring, and market insights."
      default:
        return "User is on the Water Futures AI platform."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-blue-600">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:bg-white/20"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">Water Futures AI</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Claude AI Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div
          className={`${menuOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden bg-white/10 backdrop-blur-md border-r border-white/20`}
        >
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex h-[calc(100vh-64px)]">
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>

          {/* Chatbot Sidebar */}
          <div className="w-80 border-l border-white/20 bg-white/5 backdrop-blur-sm p-4 h-full flex flex-col">
            <ChatBot context={getChatbotContext()} />
          </div>
        </div>
      </div>
    </div>
  )
}
