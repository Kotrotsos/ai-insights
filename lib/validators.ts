import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  excerpt: z.string().min(1, 'Excerpt required').max(500, 'Excerpt too long'),
  content: z.string().min(1, 'Content required'),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  readTime: z.string(),
  categories: z.array(z.string()).min(1, 'At least one category required'),
  published: z.boolean().default(false),
})

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const trackPageViewSchema = z.object({
  postId: z.string(),
  readingTime: z.number().optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>
