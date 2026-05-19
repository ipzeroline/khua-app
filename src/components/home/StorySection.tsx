import { Dictionary } from '@/i18n'
import SectionDivider from '@/components/ui/SectionDivider'

interface StorySectionProps {
  dict: Dictionary
}

export default function StorySection({ dict }: StorySectionProps) {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-3xl mx-auto text-center">
        <p className="apple-eyebrow text-gold/60 text-xs uppercase mb-4">
          {dict.story.label}
        </p>

        <h2 className="apple-headline text-3xl sm:text-4xl text-text">
          {dict.story.title}
        </h2>

        <SectionDivider />

        <p className="text-text-secondary leading-relaxed text-base sm:text-lg">
          {dict.story.p1}
        </p>

        <p className="text-text-secondary/80 leading-relaxed text-sm sm:text-base mt-4">
          {dict.story.p2}
        </p>
      </div>
    </section>
  )
}
