import { cn } from "@/lib/utils"

/** Water Futures AI mark — a droplet cradling a rising market wave. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-full w-full", className)} aria-hidden role="img">
      <defs>
        <linearGradient id="wfa-aqua" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.9 0.13 190)" />
          <stop offset="100%" stopColor="oklch(0.72 0.16 245)" />
        </linearGradient>
      </defs>
      {/* Droplet silhouette */}
      <path
        d="M16 2C16 2 5 14 5 21a11 11 0 0 0 22 0C27 14 16 2 16 2Z"
        fill="url(#wfa-aqua)"
        opacity="0.18"
      />
      <path
        d="M16 2C16 2 5 14 5 21a11 11 0 0 0 22 0C27 14 16 2 16 2Z"
        fill="none"
        stroke="url(#wfa-aqua)"
        strokeWidth="1.6"
      />
      {/* Rising wave / signal inside the droplet */}
      <path
        d="M9 22c2.4 0 2.4-3 4.8-3s2.4 3 4.8 3"
        fill="none"
        stroke="url(#wfa-aqua)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11 17l3-4 3 3 4-6"
        fill="none"
        stroke="oklch(0.92 0.12 188)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Logo mark + wordmark lockup used in the header. */
export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="glow flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 p-1.5">
        <Logo />
      </div>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-semibold tracking-tight">
          Water Futures <span className="text-primary">AI</span>
        </p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">Water risk, intelligently managed</p>
      </div>
    </div>
  )
}
