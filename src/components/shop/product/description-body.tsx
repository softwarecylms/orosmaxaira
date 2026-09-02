import { RichText } from '@/components/activities/detail/rich-text'

/**
 * Product description body.
 *
 * Blank lines separate blocks. A block whose lines all start with `- ` renders as
 * a real `<ul>`, and a block whose first line introduces such lines (e.g.
 * "Includes:") renders as a lead-in plus a list — so bullets are list markup
 * rather than dashes typed inside a paragraph.
 */
export function DescriptionBody({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  return (
    <div className="flex w-full flex-col gap-4 text-[17px] leading-[24px] text-muted">
      {blocks.map((block, i) => {
        const lines = block
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        const isItem = (l: string) => l.startsWith('- ')

        if (lines.length > 1 && lines.every(isItem)) {
          return <List key={i} items={lines} />
        }

        const [head, ...rest] = lines
        if (rest.length > 0 && rest.every(isItem)) {
          return (
            <div key={i} className="flex flex-col gap-2">
              <p>
                <RichText text={head} />
              </p>
              <List items={rest} />
            </div>
          )
        }

        return (
          <p key={i} className="whitespace-pre-line">
            <RichText text={block} />
          </p>
        )
      })}
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-accent">
      {items.map((item, i) => (
        <li key={i}>
          <RichText text={item.slice(2)} />
        </li>
      ))}
    </ul>
  )
}
