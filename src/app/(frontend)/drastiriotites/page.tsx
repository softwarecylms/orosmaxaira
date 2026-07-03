import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ACTIVITIES_PAGE } from '@/components/activities/activities-content'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHead } from '@/components/shared/section-head'
import { RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'

export const metadata: Metadata = {
  title: 'Δραστηριότητες',
  description:
    'Βιωματικές δραστηριότητες στο μελισσοκομείο του Όρους Μαχαιρά: επίσκεψη στις κυψέλες, μελισσοθεραπεία, γευσιγνωσία μελιού και εργαστήρια. Κλείστε την εμπειρία σας.',
}

export default function ActivitiesPage() {
  const a = ACTIVITIES_PAGE

  return (
    <>
      {/* 1 · Hero */}
      <PageHero
        image={a.hero.image}
        imageAlt={a.hero.imageAlt}
        title={a.hero.title}
        description={a.hero.description}
      />

      {/* 2 · Activities grid */}
      <section className="py-12 md:py-[70px]">
        <div className="container-wide flex flex-col gap-10">
          <SectionHead eyebrow={a.list.eyebrow} heading={a.list.heading} sub={a.list.sub} />
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {a.list.items.map((item) => (
              <RevealStaggerItem key={item.title} hoverLift className="flex">
                <Link
                  href={item.href}
                  className="group flex w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-card ring-1 ring-border/50 transition-shadow hover:shadow-card-lg"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-[18px] font-semibold text-foreground transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-[1.55] text-muted">{item.text}</p>
                    <ArrowRight
                      className="mt-auto size-5 shrink-0 text-accent transition-transform duration-300 ease-soft group-hover:translate-x-1.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>
    </>
  )
}
