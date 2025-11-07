'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Edit } from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: 'GITHUB' | 'TOOL'
  order: number
}

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'GITHUB' as 'GITHUB' | 'TOOL',
    order: 0,
  })

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      const response = await fetch('/api/resources')
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editing ? `/api/resources/${editing}` : '/api/resources'
      const method = editing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save')

      setFormData({ title: '', description: '', url: '', category: 'GITHUB', order: 0 })
      setEditing(null)
      loadResources()
    } catch (error) {
      console.error('Error saving resource:', error)
    }
  }

  const handleEdit = (resource: Resource) => {
    setFormData(resource)
    setEditing(resource.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return

    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
    }
  }

  const cancelEdit = () => {
    setFormData({ title: '', description: '', url: '', category: 'GITHUB', order: 0 })
    setEditing(null)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Sidebar Resources</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit' : 'Add'} Resource</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'GITHUB' | 'TOOL' })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="GITHUB">GitHub</option>
                <option value="TOOL">Tool</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                {editing ? 'Update' : 'Add'} Resource
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Resources</h2>
          <div className="space-y-4">
            {['GITHUB', 'TOOL'].map((cat) => (
              <div key={cat}>
                <h3 className="font-medium mb-2">{cat === 'GITHUB' ? 'GitHub' : 'Tools'}</h3>
                <div className="space-y-2">
                  {resources
                    .filter((r) => r.category === cat)
                    .map((resource) => (
                      <div
                        key={resource.id}
                        className="p-3 border rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {resource.url}
                            </a>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(resource)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="p-1 hover:bg-destructive/10 text-destructive rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
