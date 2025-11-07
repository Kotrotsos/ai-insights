import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FileText, Image, Link2, Eye, MessageSquare, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalImages,
    totalResources,
    totalComments,
    recentPosts,
    totalViews,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.image.count(),
    prisma.resource.count(),
    prisma.comment.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        slug: true,
        published: true,
        createdAt: true,
      },
    }),
    prisma.pageView.count(),
  ])

  const stats = [
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: FileText,
      description: `${publishedPosts} published, ${draftPosts} drafts`,
      href: '/admin/posts',
      color: 'bg-blue-500',
    },
    {
      title: 'Page Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      description: 'All time views',
      href: '/admin/posts',
      color: 'bg-green-500',
    },
    {
      title: 'Images',
      value: totalImages,
      icon: Image,
      description: 'Uploaded images',
      href: '/admin/posts',
      color: 'bg-purple-500',
    },
    {
      title: 'Resources',
      value: totalResources,
      icon: Link2,
      description: 'GitHub & Tools',
      href: '/admin/resources',
      color: 'bg-orange-500',
    },
    {
      title: 'Comments',
      value: totalComments,
      icon: MessageSquare,
      description: 'All comments',
      href: '/admin/posts',
      color: 'bg-pink-500',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your blog admin panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold mb-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/posts/new"
              className="block p-4 border rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">Create New Post</h3>
                  <p className="text-sm text-muted-foreground">
                    Write and publish a new blog post
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/posts"
              className="block p-4 border rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">Manage Posts</h3>
                  <p className="text-sm text-muted-foreground">
                    View and edit all blog posts
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/resources"
              className="block p-4 border rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Link2 className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">Manage Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Update sidebar GitHub repos and tools
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/admin/posts/${post.slug}/edit`}
                className="block p-3 border rounded-md hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {post.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      post.published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
