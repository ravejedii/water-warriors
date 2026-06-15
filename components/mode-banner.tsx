"use client"

import { useState } from "react"
import { Info, Radio, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCredentials } from "@/lib/credentials"

/** Compact Demo / Live status pill shown in the header. */
export function ModeBadge() {
  const { mode, hydrated } = useCredentials()
  const isLive = hydrated && mode === "live"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        isLive
          ? "border-success/40 bg-success/15 text-success"
          : "border-warning/40 bg-warning/15 text-warning",
      )}
    >
      <Radio className="h-3 w-3" />
      {isLive ? "Live data" : "Demo mode"}
    </span>
  )
}

/** Dismissible banner that explains demo mode and links to Settings. */
export function DemoBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { mode, hydrated } = useCredentials()
  const [dismissed, setDismissed] = useState(false)

  if (!hydrated || mode === "live" || dismissed) return null

  return (
    <div className="border-b border-warning/30 bg-warning/10">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm">
        <Info className="h-4 w-4 shrink-0 text-warning" />
        <p className="text-foreground/90">
          You're viewing <strong>realistic demo data</strong>. Connect your own API keys to use live trading,
          blockchain, and AI.
        </p>
        <Button size="sm" variant="outline" onClick={onOpenSettings} className="ml-auto hidden shrink-0 sm:inline-flex">
          Connect keys
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
