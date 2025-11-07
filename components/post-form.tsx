'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface PostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    coverImage: string | null
    readTime: string
    published: boolean
    categories: Category[]
  }
  categories: Category[]
}

export function PostForm({ post, categories }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImage: post?.coverImage || '',
    readTime: post?.readTime || '',
    published: post?.published || false,
    categories: post?.categories.map((c) => c.slug) || [],
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  const toggleCategory = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter((s) => s !== slug)
        : [...prev.categories, slug],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = post ? `/api/posts/${post.slug}` : '/api/posts'
      const method = post ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save post')
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          Slug *
        </label>
        <input
          id="slug"
          type="text"
          required
          pattern="^[a-z0-9-]+$"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
          Excerpt *
        </label>
        <textarea
          id="excerpt"
          required
          rows={3}
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Content (Markdown) *
        </label>
        <textarea
          id="content"
          required
          rows={20}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
        />
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
          Cover Image URL
        </label>
        <input
          id="coverImage"
          type="url"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="readTime" className="block text-sm font-medium mb-1">
          Read Time *
        </label>
        <input
          id="readTime"
          type="text"
          required
          placeholder="e.g., 5 min read"
          value={formData.readTime}
          onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Categories * (select at least one)
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.slug)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                formData.categories.includes(category.slug)
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="published"
          type="checkbox"
          checked={formData.published}
          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          className="h-4 w-4 rounded border-input"
        />
        <label htmlFor="published" className="ml-2 text-sm">
          Publish immediately
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || formData.categories.length === 0}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-md hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
