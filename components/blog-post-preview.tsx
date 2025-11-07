import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

interface BlogPostPreviewProps {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  content: string
  categories?: string[]
  image?: string // Added optional image prop
}

export function BlogPostPreview({
  slug,
  title,
  date,
  readTime,
  excerpt,
  content,
  categories = [],
  image, // Added image parameter
}: BlogPostPreviewProps) {
  return (
    <article className="space-y-6">
      {image && (
        <Link href={`/blog/${slug}`} className="block">
          <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg border border-border">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      <header>
        <h2 className="text-3xl font-bold mb-3 text-balance leading-tight">
          <Link href={`/blog/${slug}`} className="hover:text-accent transition-colors">
            {title}
          </Link>
        </h2>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <time dateTime={date}>{date}</time>
          <span>·</span>
          <span>{readTime}</span>
        </div>
        {categories.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        )}
      </header>

      <p className="text-lg text-muted-foreground leading-relaxed">{excerpt}</p>

      <div className="space-y-4 text-foreground/90 leading-relaxed">
        {content
          .split("\n\n")
          .slice(0, 3)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>

      <Link
        href={`/blog/${slug}`}
        className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-medium"
      >
        Read more
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}
