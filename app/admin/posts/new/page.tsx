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
