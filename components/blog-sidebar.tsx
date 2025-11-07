import Link from "next/link"

interface RecentPost {
  slug: string
  title: string
  date: string
}

interface GitHubProject {
  name: string
  url: string
  description: string
}

interface Tool {
  name: string
  url: string
  description: string
}

const recentPosts: RecentPost[] = [
  {
    slug: "understanding-transformer-architecture",
    title: "Understanding Transformer Architecture: The Foundation of Modern AI",
    date: "Nov 5, 2025",
  },
  {
    slug: "fine-tuning-llms",
    title: "Fine-Tuning Large Language Models: A Practical Guide",
    date: "Nov 2, 2025",
  },
  {
    slug: "rag-systems-explained",
    title: "RAG Systems Explained: Enhancing AI with External Knowledge",
    date: "Oct 28, 2025",
  },
  {
    slug: "prompt-engineering-tips",
    title: "Prompt Engineering: Best Practices for Better AI Outputs",
    date: "Oct 25, 2025",
  },
]

const githubProjects: GitHubProject[] = [
  {
    name: "ai-chat-interface",
    url: "https://github.com/yourusername/ai-chat-interface",
    description: "Modern chat UI for AI models",
  },
  {
    name: "vector-search-demo",
    url: "https://github.com/yourusername/vector-search-demo",
    description: "Semantic search with embeddings",
  },
  {
    name: "llm-fine-tuning-kit",
    url: "https://github.com/yourusername/llm-fine-tuning-kit",
    description: "Tools for fine-tuning LLMs",
  },
]

const tools: Tool[] = [
  {
    name: "Token Counter",
    url: "/tools/token-counter",
    description: "Count tokens for any text",
  },
  {
    name: "Prompt Tester",
    url: "/tools/prompt-tester",
    description: "Test prompts with multiple models",
  },
  {
    name: "JSON Formatter",
    url: "/tools/json-formatter",
    description: "Format and validate JSON",
  },
]

export function BlogSidebar() {
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
                <p className="text-xs text-muted-foreground no-underline">{post.date}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-foreground">GitHub</h3>
        <ul className="space-y-4">
          {githubProjects.map((project) => (
            <li key={project.name}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block space-y-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <h4 className="text-sm font-medium leading-snug">{project.name}</h4>
                <p className="text-xs text-muted-foreground no-underline">{project.description}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 text-foreground">Tools</h3>
        <ul className="space-y-4">
          {tools.map((tool) => (
            <li key={tool.name}>
              <Link
                href={tool.url}
                className="block space-y-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <h4 className="text-sm font-medium leading-snug">{tool.name}</h4>
                <p className="text-xs text-muted-foreground no-underline">{tool.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
