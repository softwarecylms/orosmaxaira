import { Container, Section } from '@/components/ui/section'
import { LinkButton } from '@/components/ui/button'

export default function NotFound() {
  return (
    <Section spacing="lg">
      <Container className="flex flex-col items-center gap-4 text-center">
        <span className="eyebrow">404</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <LinkButton href="/" variant="primary" withIcon className="mt-2">
          Back to home
        </LinkButton>
      </Container>
    </Section>
  )
}
