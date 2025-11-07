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
