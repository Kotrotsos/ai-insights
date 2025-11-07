'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Image {
  id: string
  filename: string
  url: string
  alt: string | null
  createdAt: string
  uploader: {
    name: string | null
    email: string
  }
}

interface MediaLibraryProps {
  open: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
  selectedUrl?: string
}

export function MediaLibrary({ open, onClose, onSelect, selectedUrl }: MediaLibraryProps) {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadImages()
    }
  }, [open])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/images')
      if (!response.ok) throw new Error('Failed to load images')
      const data = await response.json()
      setImages(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const newImage = await response.json()
      setImages([newImage, ...images])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="inline-block">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </span>
              </Button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images uploaded yet. Upload your first image to get started.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.url)}
                  className="relative aspect-square rounded-md overflow-hidden border-2 hover:border-primary transition-colors"
                  style={{
                    borderColor: selectedUrl === image.url ? 'hsl(var(--primary))' : 'transparent',
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt || image.filename}
                    className="w-full h-full object-cover"
                  />
                  {selectedUrl === image.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (selectedUrl) {
                onSelect(selectedUrl)
              }
              onClose()
            }}
            disabled={!selectedUrl}
          >
            Select Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
