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
