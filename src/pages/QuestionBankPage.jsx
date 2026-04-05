import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, BookOpen, Filter, Eye } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { getCategoryStyle, DIFFICULTIES } from '../lib/utils'
import { formatDate } from '../lib/dateUtils'
import { cn } from '../lib/utils'

export function QuestionBankPage() {
  const { tracks, questions } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterTrack, setFilterTrack] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterTag, setFilterTag] = useState('')

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set()
    questions.forEach(q => q.tags?.forEach(t => tags.add(t)))
    return [...tags].sort()
  }, [questions])

  const filtered = useMemo(() => {
    return questions
      .filter(q => {
        if (filterTrack !== 'all' && q.trackId !== filterTrack) return false
        if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false
        if (filterTag && !q.tags?.includes(filterTag)) return false
        if (search) {
          const s = search.toLowerCase()
          return q.title.toLowerCase().includes(s) || q.tags?.some(t => t.includes(s))
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [questions, filterTrack, filterDifficulty, filterTag, search])

  const activeFilters = [filterTrack !== 'all', filterDifficulty !== 'all', !!filterTag].filter(Boolean).length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-sm text-slate-500 mt-1">{questions.length} total questions</p>
        </div>
        <Button onClick={() => navigate('/questions/new')} icon={<Plus size={15} />}>
          Add Question
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <Input
          placeholder="Search questions by title or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search size={15} />}
        />
        <div className="flex flex-wrap gap-2">
          {/* Track filter */}
          <select
            value={filterTrack}
            onChange={e => setFilterTrack(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Tracks</option>
            {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Difficulty filter */}
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterTrack('all'); setFilterDifficulty('all'); setFilterTag('') }}
              className="text-sm text-indigo-600 hover:text-indigo-700 px-2"
            >
              Clear filters ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        questions.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={24} />}
            title="No questions yet"
            description="Start adding questions as you solve them. They'll appear here for future revision."
            action={() => navigate('/questions/new')}
            actionLabel="Add First Question"
          />
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">
            No questions match your filters.
          </div>
        )
      ) : (
        <div className="space-y-2">
          {filtered.map(q => {
            const track = tracks.find(t => t.id === q.trackId)
            const cat = getCategoryStyle(track?.category)
            const diff = DIFFICULTIES.find(d => d.id === q.difficulty)
            return (
              <button
                key={q.id}
                onClick={() => navigate(`/questions/${q.id}`)}
                className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cat?.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 mb-1.5">
                      {q.title}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {track && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cat?.bg} ${cat?.text}`}>
                          {track.name}
                        </span>
                      )}
                      {diff && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${diff.className}`}>
                          {diff.label}
                        </span>
                      )}
                      {q.tags?.map(tag => (
                        <span
                          key={tag}
                          onClick={e => { e.stopPropagation(); setFilterTag(tag) }}
                          className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-slate-400">{formatDate(q.solvedDate, 'MMM d')}</span>
                    <Eye size={14} className="text-slate-300 group-hover:text-indigo-400" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
