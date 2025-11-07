# Railway PostgreSQL Deployment Design

**Date:** November 7, 2025
**Status:** Approved
**Author:** Design Session

## Overview

This document outlines the design for migrating the AI Insights blog from hardcoded content to a dynamic PostgreSQL database deployed on Railway, with support for blog post management, user authentication, and analytics tracking.

## Goals

1. **Dynamic Blog Management**: Store blog posts in PostgreSQL instead of hardcoded components
2. **User Authentication**: Support admin users who can create/edit posts and readers who can comment
3. **Analytics Tracking**: Track page views, reading time, and engagement metrics
4. **Privacy-First**: Anonymize user data, hash IPs, no invasive tracking
5. **Developer Experience**: Type-safe queries, auto-generated TypeScript types, easy local development

## Technical Stack

### Core Technologies
- **ORM**: Prisma (chosen for excellent TypeScript support, auto-generated types, powerful migrations)
- **Database**: PostgreSQL on Railway
- **Authentication**: NextAuth.js with credentials provider
- **Content Format**: Markdown with GitHub-flavored extensions
- **Rendering**: react-markdown + remark-gfm

### Database URLs
- **Internal (Production)**: `postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@postgres.railway.internal:5432/railway`
- **Public (Local Dev)**: `postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@nozomi.proxy.rlwy.net:49259/railway`

## Database Schema

### User Model
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String    // bcrypt hashed
  name      String?
  image     String?
  role      Role      @default(READER)
  createdAt DateTime  @default(now())

  posts     Post[]
  sessions  Session[]
  comments  Comment[]
}

enum Role {
  ADMIN
  READER
}
```

### Post Model
```prisma
model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String
  content     String    @db.Text  // Markdown
  coverImage  String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  readTime    String    // e.g., "12 min read"
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
```

### Category Model
```prisma
model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique

  posts Post[] @relation("PostCategories")

  @@index([slug])
}
```

### Session Model (NextAuth)
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### PageView Model (Analytics)
```prisma
model PageView {
  id          String   @id @default(cuid())
  postId      String
  viewedAt    DateTime @default(now())
  userAgent   String?
  ipHash      String?  // SHA-256 hashed IP for privacy
  readingTime Int?     // seconds spent on page

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, viewedAt])
}
```

### Comment Model
```prisma
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

## Architecture

### Overall Flow
1. Define schema in `prisma/schema.prisma`
2. Run `prisma migrate dev` locally to create migrations
3. Push migrations to production with `prisma migrate deploy`
4. Prisma auto-generates TypeScript types
5. Use type-safe queries in Next.js API routes and server components

### Project Structure
```
prisma/
  schema.prisma          # Database schema definition
  migrations/            # Auto-generated migration files
  seed.ts               # Initial data seeding script
lib/
  prisma.ts             # Singleton Prisma client instance
  auth.ts               # NextAuth configuration
  validators.ts         # Zod schemas for input validation
app/
  api/
    auth/[...nextauth]/ # NextAuth API routes
    posts/              # CRUD endpoints for posts
    analytics/          # Analytics tracking endpoint
  admin/
    posts/              # Admin UI for creating/editing posts
    new/                # Create new post form
    [slug]/edit/        # Edit existing post
  blog/[slug]/          # Public blog post pages (existing)
components/
  markdown-editor.tsx   # Markdown editor component
  markdown-renderer.tsx # Markdown display component
```

### Environment Variables

**Local Development (.env.local):**
```env
DATABASE_URL="postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@nozomi.proxy.rlwy.net:49259/railway"
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

**Production (Railway):**
```env
DATABASE_URL="postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@postgres.railway.internal:5432/railway"
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="https://your-domain.railway.app"
```

### Prisma Client Pattern

Singleton pattern to prevent multiple instances in development:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Development Workflow

### Initial Setup
1. Install dependencies:
   ```bash
   npm install prisma @prisma/client next-auth bcrypt react-markdown remark-gfm
   npm install -D @types/bcrypt
   ```

2. Initialize Prisma:
   ```bash
   npx prisma init
   ```

3. Define schema in `prisma/schema.prisma`

4. Create initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Create and run seed script:
   ```bash
   npx prisma db seed
   ```

### Making Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Prisma auto-generates TypeScript types
4. Update application code to use new schema

### Running Locally
1. Start dev server: `npm run dev`
2. Prisma Studio (optional): `npx prisma studio` for visual database management

## Deployment Strategy

### Railway Configuration

**Build Command:**
```bash
npx prisma generate && next build
```

**Start Command:**
```bash
next start
```

**Environment Variables (set in Railway dashboard):**
- `DATABASE_URL`: Internal Railway PostgreSQL URL
- `NEXTAUTH_SECRET`: Generated secret
- `NEXTAUTH_URL`: Production domain

### Migration Strategy

**Option 1: Manual Migration (Recommended for initial deploy)**
1. Deploy application without migrations
2. Run one-time command in Railway: `npx prisma migrate deploy`
3. Restart application

**Option 2: Automatic Migration (for ongoing deploys)**
Add to `package.json`:
```json
{
  "scripts": {
    "build": "npx prisma migrate deploy && npx prisma generate && next build"
  }
}
```

### Rollback Strategy
- Prisma migrations are versioned in `prisma/migrations/`
- To rollback: `npx prisma migrate resolve --rolled-back <migration-name>`
- Emergency: Restore Railway PostgreSQL backup

## Security Considerations

### Authentication
- Password hashing: bcrypt with 10 salt rounds
- Session management: NextAuth handles secure session tokens
- CSRF protection: Built into NextAuth
- Rate limiting: Consider adding to auth endpoints (optional enhancement)

### Database Security
- Never expose `DATABASE_URL` to client-side code
- Use parameterized queries (Prisma does this automatically)
- Validate all inputs with Zod schemas before database operations
- Use Railway's internal URL in production (no internet roundtrip)

### Privacy
- Hash IP addresses with SHA-256 before storing
- No personally identifiable information in analytics
- User agent strings for bot detection only
- Optional: Cookie consent banner for compliance

### Input Validation
```typescript
// Example Zod schema
import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  categories: z.array(z.string()).min(1),
})
```

## Performance Optimizations

### Database Indexes
- `Post.slug` (unique index for fast lookups)
- `Post.published + Post.publishedAt` (composite index for listing published posts)
- `Category.slug` (unique index)
- `PageView.postId + PageView.viewedAt` (for analytics queries)
- `Comment.postId + Comment.approved` (for fetching approved comments)

### Next.js Optimizations
- Use Server Components for reading posts (no client-side overhead)
- API routes for mutations (create/update/delete)
- On-demand ISR with `revalidatePath()` after post updates
- Consider static generation for published posts with ISR fallback

### Connection Pooling
- Prisma handles connection pooling automatically
- For serverless: Consider Prisma Data Proxy or Railway's connection pooling
- Monitor connection count in Railway dashboard

## Error Handling

### Database Connection Failures
```typescript
// Graceful degradation
try {
  const posts = await prisma.post.findMany()
  return posts
} catch (error) {
  console.error('Database error:', error)
  // Return cached data or show maintenance page
  return []
}
```

### Migration Failures
- Railway deployment will fail fast if migrations fail
- Review logs in Railway dashboard
- Fix migration and redeploy

### Auth Errors
- Clear user-facing error messages via NextAuth callbacks
- Log errors server-side for debugging
- Fallback to login page on auth failures

## Testing Strategy

### Local Testing
1. Run migrations against local Railway database
2. Test CRUD operations via Prisma Studio
3. Test auth flow with test user accounts
4. Verify markdown rendering with sample posts

### Production Testing
1. Deploy to Railway staging environment first (if available)
2. Run smoke tests on critical paths
3. Monitor Railway logs for errors
4. Test rollback procedure

## Future Enhancements

### Phase 2 (Optional)
- Social authentication (Google, GitHub via NextAuth)
- Rich text editor (alternative to plain markdown)
- Image upload to Railway volumes or S3
- Email notifications for comments
- RSS feed generation
- Search functionality (PostgreSQL full-text search)
- Draft previews with share links

### Phase 3 (Optional)
- Multi-author support with contributor roles
- Series/collections of related posts
- Newsletter integration
- Advanced analytics dashboard
- Comment moderation queue
- Scheduled post publishing

## Dependencies

### New Dependencies
```json
{
  "dependencies": {
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "bcrypt": "^5.1.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0"
  }
}
```

## Success Criteria

- [ ] Blog posts stored in PostgreSQL and rendered dynamically
- [ ] Admin users can create, edit, publish, and delete posts
- [ ] Markdown content renders correctly with GFM support
- [ ] Authentication works for admin and reader roles
- [ ] Page views tracked anonymously
- [ ] Production deployment on Railway successful
- [ ] Database migrations run smoothly
- [ ] No security vulnerabilities in auth flow
- [ ] Type-safe database queries throughout codebase

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration failures in production | High | Test migrations locally first, manual deploy option |
| Connection pool exhaustion | Medium | Monitor Railway metrics, implement connection limits |
| Slow markdown rendering | Low | Use React.memo for markdown components, consider caching |
| Unauthorized access to admin routes | High | NextAuth middleware protection, role-based guards |
| Data loss during migration | High | Railway automatic backups, manual backup before deploy |

## Conclusion

This design provides a complete, production-ready solution for deploying the AI Insights blog to Railway with PostgreSQL. The Prisma-based architecture ensures type safety, excellent developer experience, and maintainability while supporting all required features: blog management, authentication, and analytics.

The phased approach allows for incremental implementation and testing, with clear rollback strategies and security considerations built in from the start.
