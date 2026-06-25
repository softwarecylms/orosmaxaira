import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/** A section of a legal document. `body` items are paragraphs (string) or bullet
 *  lists (string[]). An optional `id` lets the footer deep-link to it. */
export type LegalSection = { id?: string; heading: string; body: Array<string | string[]> }

/** Shared layout for the static legal pages (Όροι, Πολιτική Απορρήτου). */
export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <>
      <div className="container-wide pb-2 pt-4">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-[15px] text-muted md:text-[17px]"
        >
          <Link href="/" className="transition-colors hover:text-accent">
            Αρχική
          </Link>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="text-foreground">{title}</span>
        </nav>
      </div>

      <article className="container-wide py-10 md:py-14">
        <div>
          <h1 className="font-display text-[34px] font-bold leading-tight text-foreground md:text-[46px]">
            {title}
          </h1>
          <p className="mt-3 text-[14px] text-muted">{lastUpdated}</p>
          <p className="mt-6 text-[17px] leading-[28px] text-foreground/90">{intro}</p>

          <div className="mt-8 flex flex-col gap-8">
            {sections.map((s, i) => (
              <section key={s.id ?? i} id={s.id} className="scroll-mt-28">
                <h2 className="text-[22px] font-semibold text-foreground md:text-[24px]">
                  {i + 1}. {s.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {s.body.map((b, j) =>
                    Array.isArray(b) ? (
                      <ul key={j} className="list-disc space-y-2 pl-5 marker:text-accent">
                        {b.map((li, k) => (
                          <li key={k} className="text-[16px] leading-[26px] text-foreground/90">
                            {li}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={j} className="text-[16px] leading-[26px] text-foreground/90">
                        {b}
                      </p>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-border pt-6 text-[15px] leading-[24px] text-muted">
            Για οποιαδήποτε απορία, επικοινωνήστε μαζί μας μέσω του{' '}
            <Link href="/contact" className="text-accent hover:underline">
              τμήματος επικοινωνίας
            </Link>
            .
          </p>
        </div>
      </article>
    </>
  )
}
