import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, BookOpen, CalendarDays, BarChart2, Eye } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { TrackCalendar } from '../components/TrackCalendar'
import { AddQuestionForm } from './AddQuestionPage'
import { getCategoryStyle, DIFFICULTIES } from '../lib/utils'
import { TODAY, formatDate, calculateStreak, getLastNDays } from '../lib/dateUtils'
import { cn } from '../lib/utils'

const TABS = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'questions', label: 'Questions', icon: BookOpen },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
]

export function TrackDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tracks, questions, isDoneForDate } = useData()
  const [tab, setTab] = useState('calendar')
  const [showAdd, setShowAdd] = useState(false)

  const track = tracks.find(t => t.id === id)
  if (!track) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/tracks')} icon={<ArrowLeft size={15} />}>
        Back to Tracks
      </Button>
      <p className="text-slate-500 mt-4">Track not found.</p>
    </div>
  )

  const cat = getCategoryStyle(track.category)
  const trackQuestions = questions.filter(q => q.trackId === id)
  const today = TODAY()
  const doneToday = isDoneForDate(id, today)

  // Stats
  const last90 = getLastNDays(90)
  const doneDays = last90.filter(d => isDoneForDate(id, d))
  const { current: streak, longest: longestStreak } = calculateStreak(doneDays)
  const completionRate = last90.length > 0 ? Math.round((doneDays.length / last90.length) * 100) : 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/tracks')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Tracks
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '20' }}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{track.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.text}`}>{cat.label}</span>
              {doneToday ? (
                <Badge variant="done" dot>Done today</Badge>
              ) : (
                <Badge variant="pending" dot>Pending today</Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>
          Add Entry
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Current Streak', value: `${streak}d` },
          { label: 'Longest Streak', value: `${longestStreak}d` },
          { label: '90d Completion', value: `${completionRate}%` },
          { label: 'Total Questions', value: trackQuestions.length },
          { label: 'Done (90d)', value: doneDays.length },
          { label: 'Missed (90d)', value: 90 - doneDays.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-5 w-fit">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              tab === tabId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'calendar' && (
        <TrackCalendar trackId={id} questions={trackQuestions} trackCreatedAt={track.createdAt} />
      )}

      {tab === 'questions' && (
        <div>
          {trackQuestions.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No questions yet"
              description="Add your first entry to mark this track as done today."
              action={() => setShowAdd(true)}
              actionLabel="Add Question"
            />
          ) : (
            <div className="space-y-2">
              {[...trackQuestions]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(q => {
                  const diff = DIFFICULTIES.find(d => d.id === q.difficulty)
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigate(`/questions/${q.id}`)}
                      className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-indigo-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">{q.title}</div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-slate-400">{formatDate(q.solvedDate)}</span>
                            {diff && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${diff.className}`}>{diff.label}</span>
                            )}
                            {q.tags?.map(tag => (
                              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <Eye size={15} className="text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1" />
                      </div>
                    </button>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Last 30 Days Activity</h3>
          <div className="grid grid-cols-7 gap-1">
            {getLastNDays(30).map(date => {
              const done = isDoneForDate(id, date)
              return (
                <div
                  key={date}
                  title={`${formatDate(date)} — ${done ? 'Done' : 'Missed'}`}
                  className={cn(
                    'aspect-square rounded-sm',
                    done ? 'bg-emerald-500' : 'bg-slate-100'
                  )}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-xs text-slate-500">Done ({doneDays.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-100" />
              <span className="text-xs text-slate-500">Missed ({30 - getLastNDays(30).filter(d => isDoneForDate(id, d)).length})</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`Add Entry — ${track.name}`} size="xl">
        <div className="p-6">
          <AddQuestionForm defaultTrackId={id} onSuccess={() => setShowAdd(false)} />
        </div>
      </Modal>
    </div>
  )
}
