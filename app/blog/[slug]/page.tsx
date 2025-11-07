import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlogHeader } from '@/components/blog-header'
import { BlogSidebar } from '@/components/blog-sidebar'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { PageViewTracker } from '@/components/page-view-tracker'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
  })

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      categories: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <BlogHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          <main>
            <article>
              <PageViewTracker postId={post.id} />
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg mb-8"
                />
              )}

              <div className="flex gap-2 mb-4">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                <span>{post.author.name}</span>
                <span>•</span>
                <time dateTime={post.publishedAt?.toISOString()}>
                  {post.publishedAt?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              <div className="text-lg text-muted-foreground mb-8">
                {post.excerpt}
              </div>

              <MarkdownRenderer content={post.content} />
            </article>
          </main>
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}
