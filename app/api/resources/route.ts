import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const resourceSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  url: z.string().url('Invalid URL'),
  category: z.enum(['GITHUB', 'TOOL']),
  order: z.number().int().default(0),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const where = category ? { category: category as 'GITHUB' | 'TOOL' } : {}

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(resources)
  } catch (error: any) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = resourceSchema.parse(body)

    const resource = await prisma.resource.create({
      data: validatedData,
    })

    return NextResponse.json(resource)
  } catch (error: any) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create resource' },
      { status: 400 }
    )
  }
}
