import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Users, BadgeCheck, Leaf, User, Building2 } from 'lucide-react'
import { ABOUT_PAGE, type AboutValueIcon } from '@/components/about/about-content'
import { OutdoorCarousel } from '@/components/about/outdoor-carousel'
import { RevealUp, RevealGroup, RevealItem } from '@/components/home/reveal-up'
import { Counter } from '@/components/motion/counter'

export const metadata: Metadata = {
  title: 'Ποιοί είμαστε',
  description:
    'Είμαστε μία μελισσοκομική οικογένεια. Ασχολούμαστε επαγγελματικά με τη μελισσοκομία από το 1983 — αγνό κυπριακό μέλι από τα άνθη και τα βότανα του Μαχαιρά.',
}

const VALUE_ICONS: Record<AboutValueIcon, typeof BadgeCheck> = {
  purity: BadgeCheck,
  eco: Leaf,
  family: Users,
}

export default function AboutPage() {
  const a = ABOUT_PAGE

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-wide pb-2.5 pt-4">
        <RevealUp>
          <nav
            aria-label="breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[15px] text-muted md:text-[17px]"
          >
            {a.breadcrumb.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
                {b.href ? (
                  <Link href={b.href} className="transition-colors hover:text-accent">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        </RevealUp>
      </div>

      {/* Hero — photo + intro */}
      <section className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-[60px]">
          <RevealUp>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-offwhite">
              <Image
                src={a.hero.image}
                alt={a.hero.imageAlt}
                fill
                priority
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </RevealUp>

          <RevealGroup className="flex flex-col gap-5" stagger={0.08}>
            <RevealItem>
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-accent">
                {a.hero.eyebrow}
              </p>
            </RevealItem>
            <RevealItem>
              <h1 className="font-display text-[32px] font-bold leading-[1.08] text-foreground md:text-[45px]">
                {a.hero.title}
              </h1>
            </RevealItem>
            {a.hero.body.map((p, i) => (
              <RevealItem key={i}>
                <p className="text-[17px] leading-[26px] text-muted">{p}</p>
              </RevealItem>
            ))}
            <RevealItem>
              <div className="mt-1 flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-offwhite">
                  <Image src={a.hero.author.avatar} alt={a.hero.author.name} fill sizes="48px" className="object-cover" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[17px] font-medium text-foreground">{a.hero.author.name}</span>
                  <span className="text-[14px] text-muted">{a.hero.author.role}</span>
                </span>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Stats */}
      <section className="container-wide pb-12 md:pb-[60px]">
        <RevealGroup
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-accent"
          stagger={0.08}
        >
          {a.stats.map((s) => (
            <RevealItem key={s.label} className="flex flex-col items-center gap-1.5 px-2 text-center">
              <Counter
                value={s.value}
                className="font-display text-[34px] font-bold leading-none text-accent md:text-[41px]"
              />
              <span className="text-[15px] leading-[20px] text-foreground">{s.label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Values */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <RevealGroup
          className="container-wide grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-10"
          stagger={0.1}
        >
          {a.values.map((v) => {
            const Icon = VALUE_ICONS[v.icon]
            return (
              <RevealItem
                key={v.title}
                className="mx-auto flex max-w-[360px] flex-col items-center gap-[15px] text-center"
              >
                <span className="flex size-[50px] items-center justify-center rounded-full bg-accent text-white">
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="text-[20px] font-medium leading-[26.4px] text-foreground md:text-[22px]">
                  {v.title}
                </h3>
                <p className="text-[17px] leading-[24px] text-muted">{v.text}</p>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </section>

      {/* Indoor spaces */}
      <section className="container-wide py-12 md:py-[70px]">
        <RevealUp>
          <h2 className="text-center font-display text-[26px] font-semibold leading-[1.1] text-foreground md:text-[41px]">
            {a.indoor.heading}
          </h2>
        </RevealUp>
        <RevealGroup
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 md:mt-12 md:gap-8"
          stagger={0.1}
        >
          {a.indoor.cards.map((c) => (
            <RevealItem
              key={c.title}
              className="flex flex-col items-center gap-[27px] rounded-[4px] bg-offwhite px-[15px] pb-[30px] pt-[15px] text-center"
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[4px] bg-white">
                {c.image ? (
                  <Image src={c.image} alt={c.title} fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted/40">
                    <Building2 className="size-12" strokeWidth={1.2} aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-[15px]">
                <h3 className="text-[20px] font-medium leading-[26.4px] text-foreground md:text-[22px]">
                  {c.title}
                </h3>
                <p className="text-[17px] leading-[24px] text-muted">{c.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Outdoor spaces — carousel */}
      <section className="bg-offwhite py-12 md:py-[70px]">
        <div className="container-wide">
          <RevealUp>
            <h2 className="mb-8 text-center font-display text-[26px] font-semibold leading-[1.1] text-foreground md:mb-12 md:text-[41px]">
              {a.outdoor.heading}
            </h2>
          </RevealUp>
          <RevealUp>
            <OutdoorCarousel slides={a.outdoor.slides} cta={a.outdoor.cta} />
          </RevealUp>
        </div>
      </section>

      {/* Sustainability band */}
      <section className="bg-accent py-10 text-white md:py-12">
        <div className="container-page">
          <RevealUp>
            <p className="text-center text-[15px] leading-[24px] md:text-[17px]">{a.band}</p>
          </RevealUp>
        </div>
      </section>

      {/* Family */}
      <section className="container-wide py-12 md:py-[70px]">
        <RevealUp>
          <h2 className="text-center font-display text-[26px] font-semibold leading-[1.1] text-foreground md:text-[41px]">
            {a.family.heading}
          </h2>
        </RevealUp>
        <RevealGroup
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:mt-12 lg:grid-cols-5"
          stagger={0.07}
        >
          {a.family.members.map((m) => (
            <RevealItem key={m.name} className="flex flex-col overflow-hidden rounded-[4px]">
              <div className="relative aspect-[302/256] w-full overflow-hidden bg-offwhite">
                {m.photo ? (
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(min-width:1024px) 20vw, 45vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted/40">
                    <User className="size-12" strokeWidth={1.2} aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col items-center gap-[7px] bg-offwhite px-3 py-[26px] text-center md:py-[30px]">
                <span className="text-[18px] font-medium leading-[24px] text-foreground md:text-[22px] md:leading-[26.4px]">
                  {m.name}
                </span>
                <span className="text-[15px] leading-[22px] text-muted md:text-[17px] md:leading-[24px]">
                  {m.role}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Goal — full-width gold banner, beeswax image bleeding on the left (Figma 156:1211) */}
      <section className="container-wide py-14 md:py-24">
        <div className="relative overflow-hidden rounded-[4px] bg-accent">
          {/* Desktop: exact Figma banner background, rendered proportionally so the
              blocks stay in the left ~40% and never collide with the copy */}
          <Image
            src={a.goal.image}
            alt={a.goal.imageAlt}
            width={1680}
            height={300}
            sizes="100vw"
            className="hidden w-full xl:block"
          />

          {/* Mobile + small desktop: top band, text below */}
          <div className="relative h-[150px] w-full sm:h-[190px] xl:hidden">
            <Image
              src={a.goal.image}
              alt={a.goal.imageAlt}
              fill
              sizes="100vw"
              className="object-cover object-left"
            />
          </div>

          {/* Text */}
          <RevealUp className="relative flex flex-col gap-2.5 px-7 pb-9 text-white md:px-12 xl:absolute xl:inset-0 xl:ml-[49%] xl:max-w-[560px] xl:justify-center xl:py-5 xl:pb-5 xl:pl-2 xl:pr-[56px]">
            <p className="text-[14px] uppercase leading-[21px] tracking-[0.02em] text-cream">
              {a.goal.eyebrow}
            </p>
            <h2 className="font-display text-[28px] font-semibold leading-[1.1] md:text-[41px] md:leading-[44px]">
              {a.goal.title}
            </h2>
            <p className="text-[17px] leading-[24px] text-cream">{a.goal.body}</p>
          </RevealUp>
        </div>
      </section>
    </>
  )
}
