import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
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
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CredentialsProvider>{children}</CredentialsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
