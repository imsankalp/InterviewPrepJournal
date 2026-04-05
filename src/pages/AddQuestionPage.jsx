import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X, ArrowLeft } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { TRACK_CATEGORIES, DIFFICULTIES } from '../lib/utils'
import toast from 'react-hot-toast'

// Reusable form component (used in modal and as standalone page)
export function AddQuestionForm({ defaultTrackId, onSuccess }) {
  const { tracks, addQuestion } = useData()
  const [form, setForm] = useState({
    trackId: defaultTrackId || tracks[0]?.id || '',
    title: '',
    tags: '',
    difficulty: 'medium',
    source: '',
    answer: '',
  })
  const [loading, setLoading] = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.trackId) return toast.error('Please select a track.')
    if (!form.title.trim()) return toast.error('Question title is required.')
    if (!form.answer.trim()) return toast.error('Answer is required — write your solution or notes.')

    setLoading(true)
    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      await addQuestion({
        trackId: form.trackId,
        title: form.title.trim(),
        tags,
        difficulty: form.difficulty,
        source: form.source.trim(),
        answer: form.answer,
      })
      toast.success('Question saved! Track marked as done.')
      onSuccess?.()
    } catch (err) {
      toast.error('Failed to save question.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Track + Difficulty row */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Track"
          value={form.trackId}
          onChange={e => set('trackId', e.target.value)}
          required
        >
          {tracks.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        <Select
          label="Difficulty"
          value={form.difficulty}
          onChange={e => set('difficulty', e.target.value)}
        >
          {DIFFICULTIES.map(d => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </Select>
      </div>

      {/* Title */}
      <Input
        label="Question Title"
        placeholder="e.g. Explain event delegation in JavaScript"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        required
      />

      {/* Tags + Source row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tags (comma separated)"
          placeholder="closures, scope, prototype"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
          hint="e.g. array, hashmap, recursion"
        />
        <Input
          label="Source (optional)"
          placeholder="LeetCode, Interview, etc."
          value={form.source}
          onChange={e => set('source', e.target.value)}
        />
      </div>

      {/* Markdown answer */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Answer / Solution <span className="text-rose-500">*</span>
        </label>
        <MarkdownEditor
          value={form.answer}
          onChange={val => set('answer', val)}
          placeholder={`Write your solution, explanation, or notes in Markdown...\n\n## Solution\n\n\`\`\`javascript\nfunction example() {\n  // your code here\n}\n\`\`\`\n\n## Explanation\n\nExplain your approach...`}
          minHeight={250}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Save Question
        </Button>
      </div>
    </form>
  )
}

// Standalone page (navigated to via /questions/new)
export function AddQuestionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultTrackId = searchParams.get('track')

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
        <h1 className="text-2xl font-bold text-slate-900">Add Question</h1>
        <p className="text-sm text-slate-500 mt-1">Record a question and your solution/answer</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <AddQuestionForm
          defaultTrackId={defaultTrackId}
          onSuccess={() => navigate('/questions')}
        />
      </div>
    </div>
  )
}
