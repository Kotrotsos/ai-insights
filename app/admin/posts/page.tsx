import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      categories: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          New Post
        </Link>
      </div>

      <div className="bg-card border rounded-lg divide-y">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No posts yet. Create your first post!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    {post.published ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <span>
                      {post.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>{post.categories.map((c) => c.name).join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="px-3 py-1 text-sm border rounded hover:bg-accent"
                    target="_blank"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="px-3 py-1 text-sm border rounded hover:bg-accent"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
