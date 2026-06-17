import { cn } from '@/lib/utils'

export function GrowthChart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 80"
      className={cn(className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="growthGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 65 C30 60 40 50 60 45 C85 40 95 30 120 28 C150 25 165 15 200 8 L200 80 L0 80 Z"
        fill="url(#growthGradient)"
      />
      <path
        d="M0 65 C30 60 40 50 60 45 C85 40 95 30 120 28 C150 25 165 15 200 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PerformanceGauge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={cn(className)}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M20 90 A80 80 0 0 1 180 90"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M20 90 A80 80 0 0 1 174 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BarChartMini({ className }: { className?: string }) {
  const bars = [24, 68, 38, 28, 56, 75, 94, 94, 132, 122, 113, 122, 141, 170, 160]
  return (
    <svg viewBox="0 0 345 170" className={cn(className)} aria-hidden="true">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 23.5 + 0.5}
          y={170 - h}
          width={9.5}
          height={h}
          rx={2}
          fill="currentColor"
          opacity={0.35 + i * 0.04}
        />
      ))}
    </svg>
  )
}

export function SeoWaveChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 707 145" className={cn(className)} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="seoWave" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M0 110 C60 95 90 120 150 80 C210 40 250 90 320 55 C390 20 430 70 520 35 C610 0 650 45 707 25 L707 145 L0 145 Z"
        fill="url(#seoWave)"
      />
      <path
        d="M0 110 C60 95 90 120 150 80 C210 40 250 90 320 55 C390 20 430 70 520 35 C610 0 650 45 707 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
