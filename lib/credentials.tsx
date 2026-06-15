"use client"

/**
 * Client-side credential store (Bring-Your-Own-Key).
 *
 * Keys live only in the visitor's browser via localStorage and are attached to
 * outgoing API requests as headers. They are never sent anywhere except this
 * app's own API routes, which forward them to the relevant provider for that
 * single request. Clearing them returns the app to Demo Mode.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { CREDENTIAL_HEADERS } from "@/lib/server-credentials"

export interface Credentials {
  alpacaKey: string
  alpacaSecret: string
  anthropicKey: string
  crossmintKey: string
}

const EMPTY: Credentials = { alpacaKey: "", alpacaSecret: "", anthropicKey: "", crossmintKey: "" }
const STORAGE_KEY = "wfa.credentials"

interface CredentialsContextValue {
  credentials: Credentials
  /** True once localStorage has been read (avoids hydration mismatch). */
  hydrated: boolean
  /** Whether each provider has usable credentials. */
  status: { alpaca: boolean; anthropic: boolean; crossmint: boolean }
  /** "live" if any provider is configured, otherwise "demo". */
  mode: "demo" | "live"
  save: (next: Partial<Credentials>) => void
  clear: () => void
  /** Headers to merge into provider-backed fetch calls. */
  headers: () => Record<string, string>
}

const CredentialsContext = createContext<CredentialsContextValue | null>(null)

export function CredentialsProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCredentials({ ...EMPTY, ...JSON.parse(raw) })
    } catch {
      // Corrupt or unavailable storage — stay in demo mode.
    }
    setHydrated(true)
  }, [])

  const save = useCallback((next: Partial<Credentials>) => {
    setCredentials((prev) => {
      const merged = { ...prev, ...next }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      } catch {
        /* ignore */
      }
      return merged
    })
  }, [])

  const clear = useCallback(() => {
    setCredentials(EMPTY)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<CredentialsContextValue>(() => {
    const status = {
      alpaca: Boolean(credentials.alpacaKey && credentials.alpacaSecret),
      anthropic: Boolean(credentials.anthropicKey),
      crossmint: Boolean(credentials.crossmintKey),
    }
    const mode: "demo" | "live" = status.alpaca || status.anthropic || status.crossmint ? "live" : "demo"

    const headers = () => {
      const h: Record<string, string> = {}
      if (status.alpaca) {
        h[CREDENTIAL_HEADERS.alpacaKey] = credentials.alpacaKey
        h[CREDENTIAL_HEADERS.alpacaSecret] = credentials.alpacaSecret
      }
      if (status.anthropic) h[CREDENTIAL_HEADERS.anthropicKey] = credentials.anthropicKey
      if (status.crossmint) h[CREDENTIAL_HEADERS.crossmintKey] = credentials.crossmintKey
      return h
    }

    return { credentials, hydrated, status, mode, save, clear, headers }
  }, [credentials, hydrated, save, clear])

  return <CredentialsContext.Provider value={value}>{children}</CredentialsContext.Provider>
}

export function useCredentials() {
  const ctx = useContext(CredentialsContext)
  if (!ctx) throw new Error("useCredentials must be used within a CredentialsProvider")
  return ctx
}
