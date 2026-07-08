'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import type { Policy } from '@/lib/medusa/activities'
import { RichText } from './rich-text'

/** Cancellation / booking-change policies as a collapsible accordion. */
export function ActivityPolicies({ policies }: { policies: Policy[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-[22px] font-bold leading-[1.2] text-foreground md:text-[26px]">
        Χρήσιμες πληροφορίες
      </h2>
      <Accordion
        type="single"
        collapsible
        className="rounded-[16px] border border-border-strong/15 bg-white px-5 shadow-card md:px-6"
      >
        {policies.map((p, i) => (
          <AccordionItem key={i} value={`policy-${i}`}>
            <AccordionTrigger className="text-foreground hover:text-accent data-[state=open]:text-accent [&[data-state=open]>svg]:text-accent">
              {p.title}
            </AccordionTrigger>
            <AccordionContent className="leading-[1.65]">
              <RichText text={p.body} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
