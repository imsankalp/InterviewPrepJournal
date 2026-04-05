import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Target, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { getCategoryStyle, TRACK_CATEGORIES, generateId } from '../lib/utils'
import { TODAY, formatDate } from '../lib/dateUtils'
import toast from 'react-hot-toast'

export function TracksPage() {
  const { tracks, questions, addTrack, updateTrack, deleteTrack, isDoneForDate } = useData()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: 'javascript' })
  const [loading, setLoading] = useState(false)
  const today = TODAY()

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Track name is required.')
    setLoading(true)
    try {
      await addTrack({ ...form, isActive: true })
      toast.success('Track created!')
      setForm({ name: '', description: '', category: 'javascript' })
      setShowAdd(false)
    } catch (err) {
      toast.error('Failed to create track.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete track "${name}"? This won't delete existing questions.`)) return
    try {
      await deleteTrack(id)
      toast.success('Track deleted.')
    } catch {
      toast.error('Failed to delete track.')
    }
  }

  async function toggleActive(track) {
    await updateTrack(track.id, { isActive: !track.isActive })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tracks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your daily preparation categories</p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>
          New Track
        </Button>
      </div>

      {tracks.length === 0 ? (
        <EmptyState
          icon={<Target size={24} />}
          title="No tracks yet"
          description="Create your first preparation track to start your daily journey."
          action={() => setShowAdd(true)}
          actionLabel="Create Track"
        />
      ) : (
        <div className="space-y-3">
          {tracks.map(track => {
            const cat = getCategoryStyle(track.category)
            const trackQuestions = questions.filter(q => q.trackId === track.id)
            const doneToday = isDoneForDate(track.id, today)
            const active = track.isActive !== false

            return (
              <div
                key={track.id}
                className={`bg-white border rounded-xl p-5 transition-all ${active ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Color dot */}
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800">{track.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                      {!active && <Badge variant="default">Paused</Badge>}
                    </div>
                    {track.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{track.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{trackQuestions.length} questions</span>
                      <span>·</span>
                      <span>Created {formatDate(track.createdAt?.split('T')[0])}</span>
                      {doneToday && active && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-medium">Done today</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/tracks/${track.id}`)}
                      icon={<ArrowRight size={14} />}
                    >
                      View
                    </Button>
                    <button
                      onClick={() => toggleActive(track)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={active ? 'Pause track' : 'Resume track'}
                    >
                      {active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(track.id, track.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Track Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Track" size="sm">
        <form onSubmit={handleAdd} className="p-6 space-y-4">
          <Input
            label="Track Name"
            placeholder="e.g. JavaScript Problems"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <Select
            label="Category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {TRACK_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
          <Textarea
            label="Description (optional)"
            placeholder="What will you practice in this track?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={loading}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
