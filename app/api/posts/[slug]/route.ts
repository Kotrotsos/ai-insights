import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updatePostSchema } from '@/lib/validators'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.post.findUnique({
      where: { slug },
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
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
      where: { slug },
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.post.delete({
      where: { slug },
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
