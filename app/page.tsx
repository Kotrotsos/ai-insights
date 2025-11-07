import { BlogHeader } from "@/components/blog-header"
import { BlogPostPreview } from "@/components/blog-post-preview"
import { BlogSidebar } from "@/components/blog-sidebar"
import { MicroPost } from "@/components/micro-post"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      categories: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 10,
  })

  return (
    <div className="min-h-screen">
      <BlogHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <main>
            <MicroPost
              slug="quick-thought-ai-tooling"
              content="Hot take: The best AI coding tool is the one that makes you think MORE about your code, not less. If you're copy-pasting without understanding, you're building technical debt, not software."
              date="November 7, 2025"
              categories={["Quick Thoughts", "AI Tools"]}
            />

            {posts.map((post, index) => (
              <div key={post.id} className={index > 0 ? "mt-12 pt-12 border-t border-border" : "mt-12 pt-12 border-t border-border"}>
                <BlogPostPreview
                  slug={post.slug}
                  title={post.title}
                  date={post.publishedAt?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) || ''}
                  readTime={post.readTime}
                  excerpt={post.excerpt}
                  content={post.content.substring(0, 500) + '...'}
                  categories={post.categories.map(c => c.name)}
                  image={post.coverImage || undefined}
                />
              </div>
            ))}
          </main>
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}
