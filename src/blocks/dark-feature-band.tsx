import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { Counter } from '@/components/motion/counter'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Stat = { value: string; label: string }
type Block = {
  eyebrow?: string | null
  heading?: string | null
  image?: unknown
  stats?: Stat[] | null
}

export function DarkFeatureBandRender({ block }: { block: Block }) {
  const stats = (block.stats ?? []).slice(0, 4)
  const imgSrc = mediaSrc(block.image)

  return (
    <section className="py-10 md:py-16">
      <Container>
        <Reveal>
          <div className="overflow-hidden rounded-[30px] bg-surface-dark text-white">
            <div className="grid gap-0 lg:grid-cols-12">
              <div className="relative lg:col-span-5 min-h-[320px] lg:min-h-[560px]">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={mediaAlt(block.image, 'Team')}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-8 p-8 md:p-10 lg:col-span-7 lg:p-12">
                {block.eyebrow ? (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-[13px] font-medium text-foreground">
                    <span className="inline-flex size-[30px] items-center justify-center rounded-[15px] bg-accent text-white">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                    </span>
                    {block.eyebrow}
                  </span>
                ) : null}

                {block.heading ? (
                  <h2 className="max-w-xl text-2xl font-bold leading-snug tracking-tight md:text-[25px] md:leading-[1.4]">
                    {block.heading}
                  </h2>
                ) : null}

                <RevealStagger className="mt-auto grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {stats.map((s, i) => (
                    <RevealStaggerItem key={i} className="flex flex-col gap-2">
                      <Counter
                        value={s.value}
                        className="text-3xl font-bold tracking-tight md:text-[38px] md:leading-none"
                      />
                      <p className="text-sm leading-relaxed text-white/55">{s.label}</p>
                    </RevealStaggerItem>
                  ))}
                </RevealStagger>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
