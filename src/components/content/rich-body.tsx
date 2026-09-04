import { RichText } from '@/components/activities/detail/rich-text'

/**
 * Block-level renderer for admin-entered prose.
 *
 * Blank lines separate blocks. A block whose lines all start with `- ` becomes a
 * `<ul>`; one whose lines all start with `1.` / `2.` … becomes an `<ol>`; a
 * block whose first line introduces such lines renders as a lead-in plus the
 * list. Everything else is a paragraph, with single newlines preserved.
 *
 * Inline markup (`**bold**`, `*italic*`, links) is delegated to `RichText`.
 * Together these are exactly what the Medusa admin's formatting toolbar writes,
 * so what an editor sees in the toolbar is what the page renders.
 */

const BULLET = /^[-*]\s+/
const NUMBER = /^\d+[.)]\s+/

export function RichBody({
  text,
  className = 'flex w-full flex-col gap-4 text-[16px] leading-[1.8] text-muted md:text-[17px]',
}: {
  text: string
  className?: string
}) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  return (
    <div className={className}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: string }) {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const allBullets = lines.length > 0 && lines.every((l) => BULLET.test(l))
  const allNumbers = lines.length > 0 && lines.every((l) => NUMBER.test(l))
  if (allBullets) return <List items={lines} ordered={false} />
  if (allNumbers) return <List items={lines} ordered />

  // Lead-in line followed by a list ("Includes:" then the items).
  const [head, ...rest] = lines
  if (rest.length > 0 && rest.every((l) => BULLET.test(l))) {
    return <LeadIn head={head} items={rest} ordered={false} />
  }
  if (rest.length > 0 && rest.every((l) => NUMBER.test(l))) {
    return <LeadIn head={head} items={rest} ordered />
  }

  return (
    <p className="whitespace-pre-line">
      <RichText text={block} />
    </p>
  )
}

function LeadIn({ head, items, ordered }: { head: string; items: string[]; ordered: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <p>
        <RichText text={head} />
      </p>
      <List items={items} ordered={ordered} />
    </div>
  )
}

function List({ items, ordered }: { items: string[]; ordered: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag
      className={`flex flex-col gap-1.5 pl-5 marker:text-accent ${
        ordered ? 'list-decimal' : 'list-disc'
      }`}
    >
      {items.map((item, i) => (
        <li key={i}>
          <RichText text={item.replace(ordered ? NUMBER : BULLET, '')} />
        </li>
      ))}
    </Tag>
  )
}
