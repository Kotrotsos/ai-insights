# Railway PostgreSQL Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate AI Insights blog from hardcoded content to dynamic PostgreSQL database on Railway with Prisma ORM, NextAuth authentication, and analytics tracking.

**Architecture:** Prisma ORM with PostgreSQL handles data persistence. NextAuth manages authentication. Server components fetch posts, API routes handle mutations. Markdown content stored in database, rendered with react-markdown.

**Tech Stack:** Next.js 16, Prisma 5, NextAuth 4, PostgreSQL (Railway), TypeScript, react-markdown, bcrypt, Zod

---

## Task 1: Install Dependencies and Initialize Prisma

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Create: `.env.local`
- Modify: `.gitignore`

**Step 1: Install required dependencies**

Run:
```bash
npm install prisma @prisma/client next-auth bcrypt react-markdown remark-gfm
npm install -D @types/bcrypt
```

Expected: Dependencies installed successfully

**Step 2: Initialize Prisma**

Run:
```bash
npx prisma init
```

Expected: Creates `prisma/` directory with `schema.prisma` and adds `DATABASE_URL` to `.env`

**Step 3: Create .env.local with Railway database URL**

Create: `.env.local`

```env
# Database
DATABASE_URL="postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@nozomi.proxy.rlwy.net:49259/railway"

# NextAuth
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Step 4: Update .gitignore**

Add to `.gitignore`:
```
# Environment
.env
.env.local
.env*.local

# Prisma
prisma/migrations/*
!prisma/migrations/.gitkeep
```

**Step 5: Commit**

```bash
git add package.json package-lock.json prisma/schema.prisma .gitignore
git commit -m "feat: install prisma and auth dependencies"
```

---

## Task 2: Define Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Replace schema.prisma content**

Replace entire content of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  READER
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String?
  image     String?
  role      Role      @default(READER)
  createdAt DateTime  @default(now())

  posts     Post[]
  sessions  Session[]
  comments  Comment[]
}

model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String
  content     String    @db.Text
  coverImage  String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  readTime    String
  authorId    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  author      User       @relation(fields: [authorId], references: [id])
  categories  Category[] @relation("PostCategories")
  pageViews   PageView[]
  comments    Comment[]

  @@index([slug])
  @@index([published, publishedAt])
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique

  posts Post[] @relation("PostCategories")

  @@index([slug])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PageView {
  id          String   @id @default(cuid())
  postId      String
  viewedAt    DateTime @default(now())
  userAgent   String?
  ipHash      String?
  readingTime Int?

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, viewedAt])
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  postId    String
  userId    String
  createdAt DateTime @default(now())
  approved  Boolean  @default(false)

  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [userId], references: [id])

  @@index([postId, approved])
}
```

**Step 2: Generate Prisma client**

Run:
```bash
npx prisma generate
```

Expected: Prisma Client generated successfully

**Step 3: Create initial migration**

Run:
```bash
npx prisma migrate dev --name init
```

Expected: Migration created and applied, database tables created

**Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: define prisma schema for blog, auth, analytics"
```

---

## Task 3: Create Prisma Client Singleton

**Files:**
- Create: `lib/prisma.ts`

**Step 1: Create lib directory if needed**

Run:
```bash
mkdir -p lib
```

**Step 2: Create Prisma client singleton**

Create: `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 3: Verify TypeScript compiles**

Run:
```bash
npm run build
```

Expected: Build succeeds (ignore ESLint warnings per CLAUDE.md)

**Step 4: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat: add prisma client singleton"
```

---

## Task 4: Create Database Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Step 1: Create seed script**

Create: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiinsights.dev' },
    update: {},
    create: {
      email: 'admin@aiinsights.dev',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', admin.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ai-tools' },
      update: {},
      create: { name: 'AI Tools', slug: 'ai-tools' },
    }),
    prisma.category.upsert({
      where: { slug: 'productivity' },
      update: {},
      create: { name: 'Productivity', slug: 'productivity' },
    }),
    prisma.category.upsert({
      where: { slug: 'best-practices' },
      update: {},
      create: { name: 'Best Practices', slug: 'best-practices' },
    }),
    prisma.category.upsert({
      where: { slug: 'machine-learning' },
      update: {},
      create: { name: 'Machine Learning', slug: 'machine-learning' },
    }),
    prisma.category.upsert({
      where: { slug: 'transformers' },
      update: {},
      create: { name: 'Transformers', slug: 'transformers' },
    }),
    prisma.category.upsert({
      where: { slug: 'deep-learning' },
      update: {},
      create: { name: 'Deep Learning', slug: 'deep-learning' },
    }),
    prisma.category.upsert({
      where: { slug: 'quick-thoughts' },
      update: {},
      create: { name: 'Quick Thoughts', slug: 'quick-thoughts' },
    }),
  ])

  console.log('Created categories:', categories.length)

  // Create sample blog post
  const post1 = await prisma.post.upsert({
    where: { slug: 'beyond-autocomplete-mastering-ai-assisted-coding' },
    update: {},
    create: {
      slug: 'beyond-autocomplete-mastering-ai-assisted-coding',
      title: 'Beyond Autocomplete: Mastering the Art of Effective AI-Assisted Coding',
      excerpt: 'AI coding assistants have evolved far beyond simple autocomplete. Learn how to leverage these tools effectively to become a more productive developer while maintaining code quality and understanding.',
      content: `The landscape of software development has been transformed by AI-assisted coding tools. What started as simple autocomplete has evolved into sophisticated systems that can generate entire functions, refactor code, and even architect solutions. But with great power comes great responsibility—and the need for a new set of skills.

Many developers fall into the trap of treating AI assistants as magic boxes that simply produce code. They copy-paste suggestions without understanding the underlying logic, leading to technical debt and maintenance nightmares. The key to effective AI-assisted coding isn't about generating more code faster—it's about using AI as a collaborative partner in the development process.

## The Pattern of Success

The most successful developers using AI tools follow a pattern: they start with clear intent, provide context, iterate on suggestions, and critically evaluate the output. They understand that AI assistants are tools to augment their capabilities, not replace their judgment. This means knowing when to accept a suggestion, when to modify it, and when to reject it entirely.

## Prompt Engineering for Code

One crucial skill is prompt engineering for code generation. The quality of AI-generated code is directly proportional to the clarity of your request. Instead of asking 'create a login function,' effective developers provide context: 'create a secure login function using bcrypt for password hashing, with rate limiting and proper error handling for a Node.js Express application.'

## Understanding Generated Code

Another critical aspect is understanding the code that AI generates. It's tempting to accept suggestions blindly, but this leads to codebases filled with patterns you don't understand. Take time to read through generated code, understand the algorithms and patterns being used, and learn from them. AI assistants can be excellent teachers if you approach them with curiosity.

## Best Practices

1. **Always review generated code** - Don't blindly copy-paste
2. **Provide context** - The more specific your prompt, the better the output
3. **Iterate and refine** - First suggestions are rarely perfect
4. **Learn from the output** - Treat AI as a teaching tool
5. **Maintain code ownership** - You're responsible for what ships`,
      coverImage: '/ai-coding-assistant-developer-at-computer.jpg',
      published: true,
      publishedAt: new Date('2025-11-06'),
      readTime: '12 min read',
      authorId: admin.id,
      categories: {
        connect: [
          { slug: 'ai-tools' },
          { slug: 'productivity' },
          { slug: 'best-practices' },
        ],
      },
    },
  })

  console.log('Created post:', post1.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Step 2: Add seed script to package.json**

Add to `package.json` under `"scripts"`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Also install ts-node:
```bash
npm install -D ts-node
```

**Step 3: Run seed script**

Run:
```bash
npx prisma db seed
```

Expected: Admin user and categories created

**Step 4: Verify data in Prisma Studio**

Run:
```bash
npx prisma studio
```

Expected: Opens browser with database viewer, see admin user and post

**Step 5: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: add database seed script with admin user and sample post"
```

---

## Task 5: Create Validation Schemas

**Files:**
- Create: `lib/validators.ts`

**Step 1: Create Zod validation schemas**

Create: `lib/validators.ts`

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Commit**

```bash
git add lib/validators.ts
git commit -m "feat: add zod validation schemas"
```

---

## Task 6: Setup NextAuth

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

**Step 1: Create NextAuth configuration**

Create: `lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import * as bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValidPassword) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

**Step 2: Create NextAuth API route**

Create directory and file:
```bash
mkdir -p app/api/auth/\[...nextauth\]
```

Create: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add lib/auth.ts app/api/auth
git commit -m "feat: setup nextauth with credentials provider"
```

---

## Task 7: Create Posts API Routes

**Files:**
- Create: `app/api/posts/route.ts`
- Create: `app/api/posts/[slug]/route.ts`

**Step 1: Create POST endpoint for creating posts**

Create: `app/api/posts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPostSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createPostSchema.parse(body)

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        coverImage: validatedData.coverImage || null,
        readTime: validatedData.readTime,
        published: validatedData.published,
        publishedAt: validatedData.published ? new Date() : null,
        authorId: (session.user as any).id,
        categories: {
          connect: validatedData.categories.map((slug) => ({ slug })),
        },
      },
      include: {
        categories: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')

    const posts = await prisma.post.findMany({
      where: published === 'true' ? { published: true } : undefined,
      include: {
        categories: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error: any) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create individual post endpoints**

Create: `app/api/posts/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updatePostSchema } from '@/lib/validators'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        categories: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updatePostSchema.parse(body)

    const updateData: any = {
      ...(validatedData.title && { title: validatedData.title }),
      ...(validatedData.slug && { slug: validatedData.slug }),
      ...(validatedData.excerpt && { excerpt: validatedData.excerpt }),
      ...(validatedData.content && { content: validatedData.content }),
      ...(validatedData.coverImage !== undefined && { coverImage: validatedData.coverImage || null }),
      ...(validatedData.readTime && { readTime: validatedData.readTime }),
    }

    if (validatedData.published !== undefined) {
      updateData.published = validatedData.published
      updateData.publishedAt = validatedData.published ? new Date() : null
    }

    if (validatedData.categories) {
      updateData.categories = {
        set: [],
        connect: validatedData.categories.map((slug) => ({ slug })),
      }
    }

    const post = await prisma.post.update({
      where: { slug: params.slug },
      data: updateData,
      include: {
        categories: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.post.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
```

**Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/api/posts
git commit -m "feat: add posts CRUD API routes"
```

---

## Task 8: Create Analytics API Route

**Files:**
- Create: `app/api/analytics/track/route.ts`

**Step 1: Create analytics tracking endpoint**

Create directory:
```bash
mkdir -p app/api/analytics/track
```

Create: `app/api/analytics/track/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackPageViewSchema } from '@/lib/validators'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = trackPageViewSchema.parse(body)

    // Get IP and hash it for privacy
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const ipHash = createHash('sha256').update(ip).digest('hex')

    // Get user agent
    const userAgent = req.headers.get('user-agent') || undefined

    await prisma.pageView.create({
      data: {
        postId: validatedData.postId,
        ipHash,
        userAgent,
        readingTime: validatedData.readingTime,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error tracking page view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 400 }
    )
  }
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/api/analytics
git commit -m "feat: add analytics tracking API"
```

---

## Task 9: Create Markdown Renderer Component

**Files:**
- Create: `components/markdown-renderer.tsx`

**Step 1: Create markdown renderer**

Create: `components/markdown-renderer.tsx`

```typescript
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-7" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-2" {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="mb-4" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Commit**

```bash
git add components/markdown-renderer.tsx
git commit -m "feat: add markdown renderer component"
```

---

## Task 10: Update Blog Post Page to Use Database

**Files:**
- Modify: `app/blog/[slug]/page.tsx`

**Step 1: Replace hardcoded blog post page with database version**

Replace entire content of `app/blog/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlogHeader } from '@/components/blog-header'
import { BlogSidebar } from '@/components/blog-sidebar'
import { MarkdownRenderer } from '@/components/markdown-renderer'

interface BlogPostPageProps {
  params: {
    slug: string
  }
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
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  })

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
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
```

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Test locally**

Run:
```bash
npm run dev
```

Visit: http://localhost:3000/blog/beyond-autocomplete-mastering-ai-assisted-coding

Expected: Blog post renders from database

**Step 4: Commit**

```bash
git add app/blog/\[slug\]/page.tsx
git commit -m "feat: update blog post page to use database"
```

---

## Task 11: Update Home Page to Use Database

**Files:**
- Modify: `app/page.tsx`

**Step 1: Update home page to fetch posts from database**

Replace entire content of `app/page.tsx`:

```typescript
import { BlogHeader } from "@/components/blog-header"
import { BlogPostPreview } from "@/components/blog-post-preview"
import { BlogSidebar } from "@/components/blog-sidebar"
import { MicroPost } from "@/components/micro-post"
import { prisma } from "@/lib/prisma"

export const revalidate = 60 // Revalidate every 60 seconds

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
```

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Test locally**

Run:
```bash
npm run dev
```

Visit: http://localhost:3000

Expected: Home page shows posts from database

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: update home page to fetch posts from database"
```

---

## Task 12: Create Sign In Page

**Files:**
- Create: `app/auth/signin/page.tsx`

**Step 1: Create sign in page**

Create directory:
```bash
mkdir -p app/auth/signin
```

Create: `app/auth/signin/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/admin/posts')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg border">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign In</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Admin access only
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Test locally**

Run:
```bash
npm run dev
```

Visit: http://localhost:3000/auth/signin

Try login with:
- Email: admin@aiinsights.dev
- Password: admin123

Expected: Should redirect to /admin/posts (we'll create this next)

**Step 4: Commit**

```bash
git add app/auth/signin
git commit -m "feat: add admin sign in page"
```

---

## Task 13: Create Admin Posts List Page

**Files:**
- Create: `app/admin/posts/page.tsx`
- Create: `app/admin/layout.tsx`

**Step 1: Create admin layout with auth check**

Create: `app/admin/layout.tsx`

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">AI Insights Admin</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user?.email}
              </span>
              <a
                href="/api/auth/signout"
                className="text-sm text-primary hover:underline"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
```

**Step 2: Create posts list page**

Create: `app/admin/posts/page.tsx`

```typescript
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
```

**Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/admin
git commit -m "feat: add admin posts list page with auth protection"
```

---

## Task 14: Create New Post Form

**Files:**
- Create: `app/admin/posts/new/page.tsx`
- Create: `components/post-form.tsx`

**Step 1: Create reusable post form component**

Create: `components/post-form.tsx`

```typescript
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
```

**Step 2: Create new post page**

Create: `app/admin/posts/new/page.tsx`

```typescript
import { prisma } from '@/lib/prisma'
import { PostForm } from '@/components/post-form'

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <PostForm categories={categories} />
    </div>
  )
}
```

**Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/post-form.tsx app/admin/posts/new
git commit -m "feat: add new post creation form"
```

---

## Task 15: Create Edit Post Page

**Files:**
- Create: `app/admin/posts/[slug]/edit/page.tsx`

**Step 1: Create edit post page**

Create directory:
```bash
mkdir -p app/admin/posts/\[slug\]/edit
```

Create: `app/admin/posts/[slug]/edit/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostForm } from '@/components/post-form'

interface EditPostPageProps {
  params: {
    slug: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      categories: true,
    },
  })

  if (!post) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <PostForm post={post} categories={categories} />
    </div>
  )
}
```

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 3: Test the full flow locally**

Run:
```bash
npm run dev
```

1. Visit http://localhost:3000/auth/signin
2. Login with admin@aiinsights.dev / admin123
3. Should redirect to /admin/posts
4. Click "Edit" on existing post
5. Make a change and save
6. Verify changes appear on public blog

Expected: Full CRUD flow works

**Step 4: Commit**

```bash
git add app/admin/posts/\[slug\]
git commit -m "feat: add edit post page"
```

---

## Task 16: Add Page View Tracking to Blog Posts

**Files:**
- Create: `components/page-view-tracker.tsx`
- Modify: `app/blog/[slug]/page.tsx`

**Step 1: Create client-side tracking component**

Create: `components/page-view-tracker.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'

interface PageViewTrackerProps {
  postId: string
}

export function PageViewTracker({ postId }: PageViewTrackerProps) {
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Track page view on mount
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    }).catch((err) => console.error('Failed to track view:', err))

    // Track reading time on unmount
    return () => {
      const readingTime = Math.floor((Date.now() - startTime) / 1000)
      if (readingTime > 5) {
        // Only track if spent more than 5 seconds
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, readingTime }),
        }).catch((err) => console.error('Failed to track reading time:', err))
      }
    }
  }, [postId, startTime])

  return null
}
```

**Step 2: Add tracker to blog post page**

Add import and component to `app/blog/[slug]/page.tsx`:

After the MarkdownRenderer import, add:
```typescript
import { PageViewTracker } from '@/components/page-view-tracker'
```

Inside the `<article>` tag, after the opening tag, add:
```typescript
<PageViewTracker postId={post.id} />
```

**Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 4: Test tracking**

Run:
```bash
npm run dev
```

Visit a blog post and check browser console/network tab for tracking requests

**Step 5: Verify data in Prisma Studio**

Run:
```bash
npx prisma studio
```

Check PageView table for entries

**Step 6: Commit**

```bash
git add components/page-view-tracker.tsx app/blog/\[slug\]/page.tsx
git commit -m "feat: add page view tracking to blog posts"
```

---

## Task 17: Update Build Configuration for Railway

**Files:**
- Modify: `package.json`
- Create: `.env.example`

**Step 1: Update build script for Prisma**

Modify `package.json` build script:

```json
"scripts": {
  "build": "prisma generate && next build",
  "dev": "next dev",
  "lint": "eslint .",
  "start": "next start",
  "postinstall": "prisma generate"
}
```

**Step 2: Create .env.example**

Create: `.env.example`

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Step 3: Verify build works**

Run:
```bash
npm run build
```

Expected: Prisma generates client before Next.js build

**Step 4: Commit**

```bash
git add package.json .env.example
git commit -m "feat: update build config for railway deployment"
```

---

## Task 18: Create Railway Deployment README

**Files:**
- Create: `docs/RAILWAY_DEPLOYMENT.md`

**Step 1: Create deployment guide**

Create: `docs/RAILWAY_DEPLOYMENT.md`

```markdown
# Railway Deployment Guide

## Prerequisites

- Railway account
- PostgreSQL database provisioned in Railway
- GitHub repository connected to Railway

## Environment Variables

Set these in Railway dashboard:

```env
DATABASE_URL=postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@postgres.railway.internal:5432/railway
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.railway.app
```

## Initial Deployment

1. **Connect Repository**
   - Link your GitHub repo to Railway
   - Railway auto-detects Next.js

2. **Configure Build**
   - Build Command: `npm run build` (automatically runs `prisma generate`)
   - Start Command: `npm start`

3. **Run Database Migrations**

   After first deploy, run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

4. **Seed Database**

   Create initial admin user and categories:
   ```bash
   railway run npx prisma db seed
   ```

5. **Verify Deployment**
   - Visit your Railway URL
   - Login at `/auth/signin` with seeded admin credentials
   - Create your first post

## Subsequent Deployments

Railway will automatically:
1. Install dependencies
2. Generate Prisma client (`postinstall` script)
3. Build Next.js app
4. Deploy

Migrations must be run manually after schema changes:
```bash
railway run npx prisma migrate deploy
```

## Database Management

**Prisma Studio (local):**
```bash
npx prisma studio
```

**View logs:**
```bash
railway logs
```

**Connect to database:**
```bash
railway connect postgres
```

## Rollback

If deployment fails:
1. Check Railway logs
2. Roll back to previous deployment in Railway dashboard
3. If migration failed, resolve and redeploy

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is randomly generated (not default)
- [ ] `DATABASE_URL` uses internal Railway URL in production
- [ ] `.env.local` is in `.gitignore`
- [ ] Admin password changed from seed default
- [ ] HTTPS enforced (Railway handles this)

## Monitoring

Watch for:
- Database connection count (Railway dashboard)
- Response times
- Error rates in logs
- Disk usage

## Common Issues

**Build fails with "Prisma not generated":**
- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check Railway database is running
- Ensure internal URL used in production

**Auth fails:**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

## Support

- Railway docs: https://docs.railway.app
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
```

**Step 2: Commit**

```bash
git add docs/RAILWAY_DEPLOYMENT.md
git commit -m "docs: add railway deployment guide"
```

---

## Task 19: Final Testing and Verification

**Files:**
- None (testing only)

**Step 1: Full local test**

Run:
```bash
npm run build && npm start
```

Visit http://localhost:3000 and test:
- [ ] Home page shows posts from database
- [ ] Individual blog posts render correctly
- [ ] Markdown renders properly
- [ ] Categories display
- [ ] Sign in works
- [ ] Admin dashboard accessible
- [ ] Create new post works
- [ ] Edit post works
- [ ] Publish/unpublish toggles work
- [ ] Page view tracking works (check Prisma Studio)

**Step 2: Verify database state**

Run:
```bash
npx prisma studio
```

Check:
- [ ] Users table has admin
- [ ] Categories table populated
- [ ] Posts table has content
- [ ] PageView table tracks views

**Step 3: Clean up test data if needed**

If you created test posts:
```bash
npx prisma studio
```
Delete test entries

**Step 4: Final commit**

```bash
git status
```

Ensure all changes committed

---

## Task 20: Deploy to Railway

**Files:**
- None (Railway configuration)

**Step 1: Push to GitHub**

```bash
git push origin main
```

**Step 2: Configure Railway**

In Railway dashboard:
1. Create new project
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables:
   - `DATABASE_URL`: Use internal Railway URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Railway domain

**Step 3: Initial deploy**

Railway will automatically build and deploy

**Step 4: Run migrations**

In Railway CLI or dashboard:
```bash
railway run npx prisma migrate deploy
```

**Step 5: Seed database**

```bash
railway run npx prisma db seed
```

**Step 6: Verify production deployment**

1. Visit Railway URL
2. Test blog pages
3. Login to admin
4. Create a test post
5. Verify it appears on home page

**Step 7: Update admin password**

Login and create new admin user with secure password, then delete seeded user

**Step 8: Document completion**

Create final commit:
```bash
git tag -a v1.0.0 -m "Initial Railway deployment complete"
git push origin v1.0.0
```

---

## Completion Checklist

- [ ] All dependencies installed
- [ ] Prisma schema defined and migrated
- [ ] Database seeded with initial data
- [ ] API routes created (posts, analytics, auth)
- [ ] Admin UI functional (list, create, edit posts)
- [ ] Public blog pages using database
- [ ] Markdown rendering works
- [ ] Authentication protects admin routes
- [ ] Page view tracking active
- [ ] Build configuration Railway-ready
- [ ] Deployment guide documented
- [ ] Production deployment successful
- [ ] All features tested and working

## Next Steps (Optional Enhancements)

1. Add delete post functionality in admin UI
2. Create analytics dashboard showing post views
3. Add comment functionality for readers
4. Implement search feature
5. Add RSS feed generation
6. Set up automated backups
7. Add image upload capability
8. Create post preview functionality
9. Add scheduled publishing
10. Implement tag-based navigation

---

**Implementation complete!** Your AI Insights blog is now running on Railway with PostgreSQL, ready for dynamic content management.
