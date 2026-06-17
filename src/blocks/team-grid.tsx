import Image from 'next/image'
import type { TeamMember } from '@/payload-types'
import { Section, Container } from '@/components/ui/section'
import { Reveal, RevealStagger, RevealStaggerItem } from '@/components/motion/reveal'
import { mediaSrc, mediaAlt } from '@/lib/utils'

type Block = {
  eyebrow?: string | null
  heading?: string | null
  subheading?: string | null
  members?: (number | TeamMember)[] | null
}

const photoFallbackBySlug: Record<string, string> = {}

function memberPhoto(member: TeamMember) {
  const fromCms = mediaSrc(member.photo)
  if (fromCms) return fromCms
  const slug = member.name.toLowerCase().replace(/\s+/g, '-')
  return photoFallbackBySlug[slug] ?? null
}

export function TeamGridRender({ block }: { block: Block }) {
  const members = (block.members ?? []).filter(
    (m): m is TeamMember => typeof m === 'object' && m !== null,
  )
  if (!members.length) return null

  return (
    <Section spacing="default" className="bg-background" data-testid="team-grid-section" id="team">
      <Container className="flex flex-col gap-10 md:gap-12">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-16">
          {block.heading ? (
            <h2 className="font-display text-[32px] leading-[1.35] text-foreground md:text-[35px] md:leading-[52.5px]">
              {block.heading}
            </h2>
          ) : null}
          {block.subheading ? (
            <p className="text-[16px] leading-[26.4px] text-muted lg:pt-1">{block.subheading}</p>
          ) : null}
        </Reveal>

        <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m) => {
            const src = memberPhoto(m)
            const slug = m.name.toLowerCase().replace(/\s+/g, '-')
            return (
              <RevealStaggerItem
                key={m.id}
                className="flex flex-col"
                data-testid={`team-member-${slug}`}
              >
                <div className="relative aspect-[298/319] w-full overflow-hidden rounded-[20px] bg-[#f9f9fb]">
                  {src ? (
                    <Image
                      src={src}
                      alt={mediaAlt(m.photo, m.name)}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover object-top"
                    />
                  ) : null}
                </div>
                <p className="mt-5 text-center font-display text-[16px] leading-[24px] text-foreground">
                  {m.name}
                </p>
                {m.role ? (
                  <p className="mt-1 text-center text-[14px] leading-[23.1px] text-muted">{m.role}</p>
                ) : null}
              </RevealStaggerItem>
            )
          })}
        </RevealStagger>
      </Container>
    </Section>
  )
}
