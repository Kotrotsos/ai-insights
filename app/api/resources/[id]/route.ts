import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const resourceSchema = z.object({
  title: z.string().min(1, 'Title required').optional(),
  description: z.string().min(1, 'Description required').optional(),
  url: z.string().url('Invalid URL').optional(),
  category: z.enum(['GITHUB', 'TOOL']).optional(),
  order: z.number().int().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = resourceSchema.parse(body)

    const resource = await prisma.resource.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(resource)
  } catch (error: any) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update resource' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.resource.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
