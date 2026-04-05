import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, Save, X } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { MarkdownViewer } from '../components/MarkdownViewer'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { getCategoryStyle, DIFFICULTIES } from '../lib/utils'
import { formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

export function QuestionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { questions, tracks, updateQuestion, deleteQuestion } = useData()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const question = questions.find(q => q.id === id)
  const [editForm, setEditForm] = useState(null)

  if (!question) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/questions')} icon={<ArrowLeft size={15} />}>
        Back
      </Button>
      <p className="text-slate-500 mt-4">Question not found.</p>
    </div>
  )

  const track = tracks.find(t => t.id === question.trackId)
  const cat = getCategoryStyle(track?.category)
  const diff = DIFFICULTIES.find(d => d.id === question.difficulty)

  function startEdit() {
    setEditForm({
      title: question.title,
      difficulty: question.difficulty || 'medium',
      tags: question.tags?.join(', ') || '',
      source: question.source || '',
      answer: question.answer || '',
    })
    setEditing(true)
  }

  async function handleSave() {
    if (!editForm.title.trim()) return toast.error('Title is required.')
    if (!editForm.answer.trim()) return toast.error('Answer is required.')
    setLoading(true)
    try {
      await updateQuestion(id, {
        title: editForm.title.trim(),
        difficulty: editForm.difficulty,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        source: editForm.source.trim(),
        answer: editForm.answer,
      })
      toast.success('Question updated.')
      setEditing(false)
    } catch {
      toast.error('Failed to update question.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this question?')) return
    try {
      await deleteQuestion(id)
      toast.success('Question deleted.')
      navigate('/questions')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {editing ? (
        /* Edit mode */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Edit Question</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)} icon={<X size={14} />}>
                Cancel
              </Button>
              <Button size="sm" loading={loading} onClick={handleSave} icon={<Save size={14} />}>
                Save
              </Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Track"
                value={question.trackId}
                disabled
              >
                {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select
                label="Difficulty"
                value={editForm.difficulty}
                onChange={e => setEditForm(f => ({ ...f, difficulty: e.target.value }))}
              >
                {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </Select>
            </div>
            <Input
              label="Title"
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tags"
                placeholder="closures, scope"
                value={editForm.tags}
                onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
              />
              <Input
                label="Source"
                value={editForm.source}
                onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Answer</label>
              <MarkdownEditor
                value={editForm.answer}
                onChange={val => setEditForm(f => ({ ...f, answer: val }))}
                minHeight={300}
              />
            </div>
          </div>
        </div>
      ) : (
        /* View mode */
        <div>
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-slate-900 leading-snug flex-1">{question.title}</h1>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={startEdit} icon={<Edit3 size={14} />}>
                  Edit
                </Button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {track && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat?.bg} ${cat?.text}`}>
                  {track.name}
                </span>
              )}
              {diff && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diff.className}`}>
                  {diff.label}
                </span>
              )}
              {question.tags?.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
              <span className="text-xs text-slate-400 ml-auto">
                Solved {formatDate(question.solvedDate)}
              </span>
            </div>

            {question.source && (
              <p className="text-xs text-slate-400 mt-2">Source: {question.source}</p>
            )}
          </div>

          {/* Answer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">
              Answer / Solution
            </h2>
            {question.answer ? (
              <MarkdownViewer content={question.answer} />
            ) : (
              <p className="text-sm text-slate-400 italic">No answer recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
