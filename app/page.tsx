"use client"

import { useState } from "react"
import { DollarSign, LineChart, Settings, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Wordmark } from "@/components/logo"
import { DemoBanner, ModeBadge } from "@/components/mode-banner"
import { SettingsDialog } from "@/components/settings-dialog"
import ChatBot from "@/components/chatbot"
import TradingDashboard from "@/components/trading-dashboard"
import GovernmentSubsidy from "@/components/government-subsidy"
import FuturesRecommendations from "@/components/futures-recommendations"
import type { DroughtLevel } from "@/lib/demo-data"

type TabId = "trading" | "subsidy" | "futures"

const TABS: { id: TabId; label: string; icon: typeof TrendingUp }[] = [
  { id: "trading", label: "Trading", icon: TrendingUp },
  { id: "subsidy", label: "Subsidies", icon: DollarSign },
  { id: "futures", label: "Futures", icon: LineChart },
]

export default function Home() {
  const [tab, setTab] = useState<TabId>("trading")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [droughtLevel, setDroughtLevel] = useState<DroughtLevel>("medium")

  return (
    <div className="min-h-dvh">
      <div className="bg-fx" />

      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Wordmark />
          <div className="flex items-center gap-1.5">
            <ModeBadge />
            <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
              )}
            </button>
          ))}
        </nav>
      </header>

      <DemoBanner onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-7 pb-28">
        {tab === "trading" && <TradingDashboard />}
        {tab === "subsidy" && <GovernmentSubsidy droughtLevel={droughtLevel} setDroughtLevel={setDroughtLevel} />}
        {tab === "futures" && <FuturesRecommendations />}
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ChatBot droughtLevel={droughtLevel} />
    </div>
  )
}
