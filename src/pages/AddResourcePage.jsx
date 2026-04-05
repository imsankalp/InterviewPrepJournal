import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { RESOURCE_SOURCES } from '../lib/utils'
import toast from 'react-hot-toast'

export function AddResourcePage() {
  const { addResource } = useData()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    category: '',
    source: 'claude',
    tags: '',
    content: '',
  })
  const [loading, setLoading] = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required.')
    if (!form.content.trim()) return toast.error('Content is required.')
    setLoading(true)
    try {
      await addResource({
        title: form.title.trim(),
        category: form.category.trim(),
        source: form.source,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        content: form.content,
      })
      toast.success('Resource saved!')
      navigate('/resources')
    } catch {
      toast.error('Failed to save resource.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Save Resource</h1>
        <p className="text-sm text-slate-500 mt-1">
          Save answers, explanations, or notes from AI tools or articles for future revision.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. React useCallback vs useMemo — when to use each"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              placeholder="e.g. React, JavaScript, System Design"
              value={form.category}
              onChange={e => set('category', e.target.value)}
            />
            <Select
              label="Source"
              value={form.source}
              onChange={e => set('source', e.target.value)}
            >
              {RESOURCE_SOURCES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Tags (comma separated)"
            placeholder="hooks, performance, memoization"
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Content <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-400">
              Paste or type the explanation/answer you want to save. Markdown is supported.
            </p>
            <MarkdownEditor
              value={form.content}
              onChange={val => set('content', val)}
              minHeight={320}
              placeholder={`Paste or write your resource content here...\n\n## Key Points\n\n- Point 1\n- Point 2\n\n## Code Example\n\n\`\`\`javascript\n// example\n\`\`\``}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Save Resource
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
