'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Counter } from '@/components/motion/counter'
import { useMotionReady } from '@/components/motion/motion-ready'

const avatarPaths: string[] = []

export function GrowthValue({ value }: { value: string }) {
  return (
    <Counter
      value={value}
      duration={1.8}
      className="font-display text-[23.6px] leading-[25px] text-foreground"
    />
  )
}

export function GrowthTrendBadge() {
  return null
}

export function GrowthChartImage() {
  return null
}

export function PerformanceRings() {
  return null
}

const gaugeStats = [
  { label: 'Users', value: '15,000+' },
  { label: 'Orders', value: '1,200+' },
  { label: 'Conversions', value: '4.8%' },
] as const

export function GaugeStatsGrid() {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!ready || reduceMotion) {
    return (
      <div className="mt-[41px] grid grid-cols-3 gap-3">
        {gaugeStats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[14px] font-medium leading-[23.1px] text-muted">{stat.label}</p>
            <p className="font-display text-[19.5px] leading-5 text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-[41px] grid grid-cols-3 gap-3">
      {gaugeStats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.12 + i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <p className="text-[14px] font-medium leading-[23.1px] text-muted">{stat.label}</p>
          <Counter
            value={stat.value}
            duration={1.6}
            className="font-display text-[19.5px] leading-5 text-foreground"
          />
        </motion.div>
      ))}
    </div>
  )
}

export function StatsAvatarRow() {
  const ready = useMotionReady()
  const reduceMotion = useReducedMotion()

  if (!ready || reduceMotion) {
    return (
      <div className="relative z-10 mt-auto flex pt-2">
        {avatarPaths.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={50}
            height={50}
            className="size-[50px] rounded-full border-4 border-pink object-cover"
            style={{ marginLeft: idx === 0 ? 0 : -10 }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative z-10 mt-auto flex pt-2">
      {avatarPaths.map((src, idx) => (
        <motion.div
          key={src}
          initial={{ opacity: 0, scale: 0.5, x: -8 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.45,
            delay: 0.35 + idx * 0.07,
            type: 'spring',
            stiffness: 320,
            damping: 22,
          }}
          style={{ marginLeft: idx === 0 ? 0 : -10 }}
        >
          <Image
            src={src}
            alt=""
            width={50}
            height={50}
            className="size-[50px] rounded-full border-4 border-pink object-cover"
          />
        </motion.div>
      ))}
    </div>
  )
}
