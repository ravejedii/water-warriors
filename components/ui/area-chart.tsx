"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

interface AreaChartProps {
  data: number[]
  className?: string
  /** CSS color for the line/fill. Defaults to the aqua primary. */
  color?: string
  height?: number
}

const W = 600
const PAD = 6

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return ""
  const d = [`M ${points[0][0]} ${points[0][1]}`]
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2[0]} ${p2[1]}`)
  }
  return d.join(" ")
}

export function AreaChart({ data, className, color = "var(--primary)", height = 160 }: AreaChartProps) {
  const id = useId().replace(/:/g, "")
  const H = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = (W - PAD * 2) / (data.length - 1)

  const points: [number, number][] = data.map((v, i) => [
    PAD + i * stepX,
    PAD + (1 - (v - min) / span) * (H - PAD * 2),
  ])

  const line = smoothPath(points)
  const area = `${line} L ${points[points.length - 1][0]} ${H} L ${points[0][0]} ${H} Z`
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label="Trend chart"
    >
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
    </svg>
  )
}
