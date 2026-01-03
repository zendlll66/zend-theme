import { Button } from "../button"

export function HeroSection({ title, description, ctaText, ctaLink }) {
  return (
    <section className="relative py-20 px-6 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 text-[hsl(var(--primary-foreground))]">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">{title}</h1>
        {description && (
          <p className="text-xl mb-8 opacity-90">{description}</p>
        )}
        {ctaText && (
          <Button variant="secondary" size="lg" asChild>
            <a href={ctaLink || "#"}>{ctaText}</a>
          </Button>
        )}
      </div>
    </section>
  )
}

