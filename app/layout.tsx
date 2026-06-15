import type React from "react"
import type { Metadata } from "next"
import "@fontsource-variable/inter"
import "@fontsource-variable/space-grotesk"
import { CredentialsProvider } from "@/lib/credentials"
import "./globals.css"

export const metadata: Metadata = {
  title: "Water Futures AI — AI-Powered Water Risk Management",
  description:
    "An AI-powered platform combining satellite drought analytics, water futures trading, and blockchain subsidies to help farmers manage water-scarcity risk.",
  authors: [{ name: "ravejedii", url: "https://github.com/ravejedii" }],
  keywords: ["water futures", "drought", "AI trading", "blockchain subsidies", "Next.js", "Claude"],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <CredentialsProvider>{children}</CredentialsProvider>
      </body>
    </html>
  )
}
