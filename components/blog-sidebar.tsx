import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function BlogSidebar() {
  const [recentPosts, githubResources, toolResources] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        publishedAt: true,
      },
    }),
    prisma.resource.findMany({
      where: { category: 'GITHUB' },
      orderBy: { order: 'asc' },
    }),
    prisma.resource.findMany({
      where: { category: 'TOOL' },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-4 text-foreground">Recent Posts</h3>
        <ul className="space-y-4">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block space-y-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <h4 className="text-sm font-medium leading-snug line-clamp-2">{post.title}</h4>
                <p className="text-xs text-muted-foreground no-underline">
                  {post.publishedAt?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {githubResources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">GitHub</h3>
          <ul className="space-y-4">
            {githubResources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <h4 className="text-sm font-medium leading-snug">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground no-underline">{resource.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {toolResources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Tools</h3>
          <ul className="space-y-4">
            {toolResources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <h4 className="text-sm font-medium leading-snug">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground no-underline">{resource.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
