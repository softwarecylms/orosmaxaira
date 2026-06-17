import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight } from './icons'

type Variant = 'gold' | 'white' | 'outline' | 'link'

const variants: Record<Variant, string> = {
  // Solid honey button, white label + arrow (Figma "Yellow").
  gold: 'bg-accent text-white hover:bg-gold-strong p-[15px] rounded-[4px]',
  // White button, gold label + arrow (Figma "White").
  white: 'bg-white text-accent hover:bg-white/90 p-[15px] rounded-[4px]',
  // Outline gold.
  outline:
    'border border-accent text-accent hover:bg-accent hover:text-white p-[15px] rounded-[4px]',
  // Inline gold "Δείτε περισσότερα →" text link used on section headers.
  link: 'text-accent hover:text-gold-strong gap-2',
}

type CtaLinkProps = {
  href: string
  children: React.ReactNode
  variant?: Variant
  className?: string
  newTab?: boolean
  arrow?: boolean
}

export function CtaLink({
  href,
  children,
  variant = 'gold',
  className,
  newTab,
  arrow = true,
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-3 whitespace-nowrap text-[17px] font-normal leading-[24px] transition-colors',
        variants[variant],
        className,
      )}
    >
      {children}
      {arrow ? <ArrowRight className="size-[15px]" /> : null}
    </Link>
  )
}
