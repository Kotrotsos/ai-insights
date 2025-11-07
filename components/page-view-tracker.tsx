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
