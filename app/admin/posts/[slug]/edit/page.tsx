import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostForm } from '@/components/post-form'

interface EditPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
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
