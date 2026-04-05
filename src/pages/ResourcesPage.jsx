import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Bookmark, Eye, Trash2, ExternalLink } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { MarkdownViewer } from '../components/MarkdownViewer'
import { RESOURCE_SOURCES } from '../lib/utils'
import { formatDate } from '../lib/dateUtils'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const SOURCE_COLORS = {
  claude: 'bg-violet-100 text-violet-700',
  chatgpt: 'bg-emerald-100 text-emerald-700',
  gemini: 'bg-blue-100 text-blue-700',
  article: 'bg-amber-100 text-amber-700',
  video: 'bg-rose-100 text-rose-700',
  other: 'bg-slate-100 text-slate-600',
}

export function ResourcesPage() {
  const { resources, deleteResource } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewing, setViewing] = useState(null)

  const allCategories = useMemo(() => {
    const cats = new Set(resources.map(r => r.category).filter(Boolean))
    return [...cats].sort()
  }, [resources])

  const filtered = useMemo(() => {
    return resources
      .filter(r => {
        if (filterSource !== 'all' && r.source !== filterSource) return false
        if (filterCategory !== 'all' && r.category !== filterCategory) return false
        if (search) {
          const s = search.toLowerCase()
          return r.title.toLowerCase().includes(s) ||
            r.category?.toLowerCase().includes(s) ||
            r.tags?.some(t => t.toLowerCase().includes(s))
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [resources, filterSource, filterCategory, search])

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await deleteResource(id)
      if (viewing?.id === id) setViewing(null)
      toast.success('Resource deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
          <p className="text-sm text-slate-500 mt-1">
            {resources.length} saved resource{resources.length !== 1 ? 's' : ''} for revision
          </p>
        </div>
        <Button onClick={() => navigate('/resources/new')} icon={<Plus size={15} />}>
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search size={15} />}
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Sources</option>
            {RESOURCE_SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {allCategories.length > 0 && (
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Resource list */}
      {filtered.length === 0 ? (
        resources.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={24} />}
            title="No resources yet"
            description="Save important answers from ChatGPT, Claude, or Gemini for quick revision."
            action={() => navigate('/resources/new')}
            actionLabel="Save First Resource"
          />
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">No resources match your filters.</div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              onView={() => setViewing(r)}
              onDelete={() => handleDelete(r.id, r.title)}
            />
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        size="xl"
      >
        {viewing && (
          <div>
            {/* Meta */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
              {viewing.category && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {viewing.category}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[viewing.source] || SOURCE_COLORS.other}`}>
                {RESOURCE_SOURCES.find(s => s.id === viewing.source)?.label || viewing.source}
              </span>
              {viewing.tags?.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
              <span className="text-xs text-slate-400 ml-auto">{formatDate(viewing.createdAt?.split('T')[0])}</span>
            </div>
            <div className="p-6">
              <MarkdownViewer content={viewing.content} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ResourceCard({ resource, onView, onDelete }) {
  const sourceColor = SOURCE_COLORS[resource.source] || SOURCE_COLORS.other
  const sourceLabel = RESOURCE_SOURCES.find(s => s.id === resource.source)?.label || resource.source

  // Preview: first 120 chars of content
  const preview = resource.content?.replace(/[#*`>\-]/g, '').trim().slice(0, 120)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
          {resource.title}
        </h3>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {preview && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{preview}…</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {resource.category && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
            {resource.category}
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sourceColor}`}>
          {sourceLabel}
        </span>
        {resource.tags?.slice(0, 2).map(tag => (
          <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
        <button
          onClick={onView}
          className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Eye size={12} /> View
        </button>
      </div>
    </div>
  )
}
