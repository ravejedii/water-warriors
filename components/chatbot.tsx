"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Bot, KeyRound, Loader2, MessageCircle, Send, Sparkles, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { useCredentials } from "@/lib/credentials"

const MODE_CHOSEN_KEY = "wfa.chatModeChosen"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
}

const GREETING: Message = {
  id: "greeting",
  sender: "bot",
  content:
    "Hi! I'm the Water Futures AI assistant. Ask me about water futures, drought subsidies, or trading — or try a command like \"buy 5 AWK\", \"check my balance\", or \"claim subsidy\".",
}

const SUGGESTIONS = ["What are water futures?", "buy 5 AWK", "check my balance", "claim subsidy"]

export default function ChatBot({
  droughtLevel = "medium",
  onConnectKeys,
}: {
  droughtLevel?: "high" | "medium" | "low"
  onConnectKeys?: () => void
}) {
  const { headers, mode, hydrated } = useCredentials()
  const [open, setOpen] = useState(false)
  const [modePrompt, setModePrompt] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // On first open in demo mode, ask whether to stay in demo or connect live keys.
  const openChat = () => {
    setOpen(true)
    if (mode === "demo") {
      let chosen = false
      try {
        chosen = Boolean(localStorage.getItem(MODE_CHOSEN_KEY))
      } catch {
        /* ignore */
      }
      if (!chosen) setModePrompt(true)
    }
  }

  const rememberChoice = () => {
    try {
      localStorage.setItem(MODE_CHOSEN_KEY, "1")
    } catch {
      /* ignore */
    }
    setModePrompt(false)
  }

  const chooseLive = () => {
    rememberChoice()
    onConnectKeys?.()
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, content: trimmed, sender: "user" }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({ message: trimmed, droughtLevel }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-b`, content: data.response ?? data.error ?? "Something went wrong.", sender: "bot" },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-b`, content: "I couldn't reach the server. Please try again.", sender: "bot" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <Button
        onClick={openChat}
        size="lg"
        className={cn(
          "fixed bottom-5 right-5 z-40 h-14 rounded-full px-5 shadow-lg shadow-primary/30 transition-transform hover:scale-105",
          open && "pointer-events-none opacity-0",
        )}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask AI</span>
      </Button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Slide-over panel */}
      {open && (
        <div className="glass fixed inset-y-0 right-0 z-50 flex w-full flex-col shadow-2xl duration-200 animate-in slide-in-from-right sm:m-3 sm:w-[400px] sm:rounded-2xl">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 p-1.5">
                <Logo />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">AI Assistant</p>
                <p className="text-xs text-muted-foreground">
                  {hydrated && mode === "live" ? "Live · Claude" : "Demo mode"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2.5", m.sender === "user" ? "justify-end" : "justify-start")}>
                {m.sender === "bot" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.sender === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
                {m.sender === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything…"
                disabled={loading}
              />
              <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* First-run: choose demo vs. live data */}
      <Dialog open={modePrompt} onOpenChange={setModePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How would you like to run?
            </DialogTitle>
            <DialogDescription>
              You're in demo mode — the assistant and data use realistic samples. Switch to live mode to chat with a
              real Claude model and connect your own trading and blockchain accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={rememberChoice}
              className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40"
            >
              <p className="flex items-center gap-2 font-medium">
                <Bot className="h-4 w-4 text-muted-foreground" />
                Stay in demo
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Explore everything with sample data. No keys needed.</p>
            </button>
            <button
              onClick={chooseLive}
              className="glow rounded-xl border border-primary/50 bg-primary/10 p-4 text-left transition-colors hover:bg-primary/15"
            >
              <p className="flex items-center gap-2 font-medium">
                <KeyRound className="h-4 w-4 text-primary" />
                Go live
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Add your API keys to use real AI, trading, and USDC.</p>
            </button>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={rememberChoice}>
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
