"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { DollarSign, Droplets, LineChart, Moon, Settings, Sun, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("trading")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [droughtLevel, setDroughtLevel] = useState<DroughtLevel>("medium")

  return (
    <div className="app-shell min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Droplets className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold">Water Futures AI</p>
              <p className="hidden text-xs text-muted-foreground sm:block">AI-powered water risk management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeBadge />
            <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <DemoBanner onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">
        {tab === "trading" && <TradingDashboard />}
        {tab === "subsidy" && <GovernmentSubsidy droughtLevel={droughtLevel} setDroughtLevel={setDroughtLevel} />}
        {tab === "futures" && <FuturesRecommendations />}
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ChatBot droughtLevel={droughtLevel} />
    </div>
  )
}
