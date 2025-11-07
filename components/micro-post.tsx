import Link from "next/link"

interface MicroPostProps {
  slug: string
  content: string
  date: string
  categories?: string[]
}

export function MicroPost({ slug, content, date, categories = [] }: MicroPostProps) {
  return (
    <article className="border-l-2 border-accent pl-6 py-4 space-y-3">
      <p className="text-foreground leading-relaxed">{content}</p>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <time className="text-sm text-muted-foreground" dateTime={date}>
          {date}
        </time>

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
