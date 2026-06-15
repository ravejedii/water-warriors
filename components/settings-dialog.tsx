"use client"

import { useEffect, useState } from "react"
import { KeyRound, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Credentials, useCredentials } from "@/lib/credentials"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FIELDS: { key: keyof Credentials; label: string; placeholder: string; help: string }[] = [
  { key: "anthropicKey", label: "Anthropic API key", placeholder: "sk-ant-...", help: "Powers the live AI assistant (Claude)." },
  { key: "alpacaKey", label: "Alpaca API key", placeholder: "PK...", help: "Paper-trading account key." },
  { key: "alpacaSecret", label: "Alpaca API secret", placeholder: "Your Alpaca secret", help: "Paired with the Alpaca key." },
  { key: "crossmintKey", label: "Crossmint API key", placeholder: "sk_staging_...", help: "Enables real USDC subsidy transfers." },
]

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { credentials, save, clear } = useCredentials()
  const [draft, setDraft] = useState<Credentials>(credentials)

  // Re-sync the form whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) setDraft(credentials)
  }, [open, credentials])

  const handleSave = () => {
    save(draft)
    onOpenChange(false)
  }

  const handleClear = () => {
    clear()
    setDraft({ alpacaKey: "", alpacaSecret: "", anthropicKey: "", crossmintKey: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Connect your own keys
          </DialogTitle>
          <DialogDescription>
            The app runs in demo mode by default. Add your own API keys to switch any feature to live data. Leave a
            field blank to keep that feature in demo mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="password"
                autoComplete="off"
                placeholder={field.placeholder}
                value={draft[field.key]}
                onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{field.help}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p>
            Your keys are stored only in this browser (localStorage) and sent with each request to power live calls.
            They are never persisted on the server. Clearing them returns the app to demo mode.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClear} className="sm:mr-auto">
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save keys</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
