import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle2, Clock, AlertCircle, ArrowRight, Flame, BookOpen, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { AddQuestionForm } from './AddQuestionPage'
import { TODAY, formatDate, calculateStreak, getLastNDays } from '../lib/dateUtils'
import { getCategoryStyle } from '../lib/utils'
import { format } from 'date-fns'

export function DashboardPage() {
  const { user } = useAuth()
  const { tracks, questions, isDoneForDate, getQuestionsForDate } = useData()
  const navigate = useNavigate()
  const [addingFor, setAddingFor] = useState(null) // trackId
  const today = TODAY()

  const activeTracks = tracks.filter(t => t.isActive !== false)
  const doneTodayCount = activeTracks.filter(t => isDoneForDate(t.id, today)).length

  // Streak: days where ALL active tracks were done
  const last90 = getLastNDays(90)
  const allDoneDays = last90.filter(d =>
    activeTracks.length > 0 && activeTracks.every(t => isDoneForDate(t.id, d))
  )
  const { current: currentStreak } = calculateStreak(allDoneDays)

  // Total questions
  const totalQuestions = questions.length
  const todayQuestions = questions.filter(q => q.solvedDate === today)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.username} 👋
        </h1>
        <p className="text-slate-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Flame size={18} className="text-orange-500" />}
          label="Current Streak"
          value={`${currentStreak} day${currentStreak !== 1 ? 's' : ''}`}
          sub={currentStreak > 0 ? 'Keep it up!' : 'Start today!'}
          color="bg-orange-50 border-orange-100"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          label="Done Today"
          value={`${doneTodayCount} / ${activeTracks.length}`}
          sub="tracks completed"
          color="bg-emerald-50 border-emerald-100"
        />
        <StatCard
          icon={<BookOpen size={18} className="text-indigo-500" />}
          label="Total Questions"
          value={totalQuestions}
          sub={`${todayQuestions.length} added today`}
          color="bg-indigo-50 border-indigo-100"
        />
      </div>

      {/* Today's Tracks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Today's Preparation</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tracks')} icon={<ArrowRight size={14} />}>
            Manage Tracks
          </Button>
        </div>

        {activeTracks.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={24} />}
            title="No tracks yet"
            description="Create your first preparation track to start tracking your daily progress."
            action={() => navigate('/tracks')}
            actionLabel="Create Track"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTracks.map(track => {
              const done = isDoneForDate(track.id, today)
              const todayQs = getQuestionsForDate(track.id, today)
              const cat = getCategoryStyle(track.category)
              return (
                <TrackCard
                  key={track.id}
                  track={track}
                  done={done}
                  todayQs={todayQs}
                  cat={cat}
                  onAdd={() => setAddingFor(track.id)}
                  onClick={() => navigate(`/tracks/${track.id}`)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Questions */}
      {questions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Recent Questions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/questions')} icon={<ArrowRight size={14} />}>
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {[...questions]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map(q => {
                const track = tracks.find(t => t.id === q.trackId)
                const cat = getCategoryStyle(track?.category)
                return (
                  <button
                    key={q.id}
                    onClick={() => navigate(`/questions/${q.id}`)}
                    className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-indigo-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color }} />
                      <span className="text-sm font-medium text-slate-800 flex-1 truncate group-hover:text-indigo-700">
                        {q.title}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(q.solvedDate, 'MMM d')}</span>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      <Modal
        isOpen={!!addingFor}
        onClose={() => setAddingFor(null)}
        title={`Add Entry — ${tracks.find(t => t.id === addingFor)?.name || ''}`}
        size="xl"
      >
        {addingFor && (
          <div className="p-6">
            <AddQuestionForm
              defaultTrackId={addingFor}
              onSuccess={() => setAddingFor(null)}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`bg-white border rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  )
}

function TrackCard({ track, done, todayQs, cat, onAdd, onClick }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cat?.color }} />
        <div className="flex-1 min-w-0">
          <button onClick={onClick} className="text-sm font-semibold text-slate-800 hover:text-indigo-700 truncate block w-full text-left">
            {track.name}
          </button>
          {track.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{track.description}</p>
          )}
          {todayQs.length > 0 && (
            <p className="text-xs text-emerald-600 mt-1">{todayQs.length} question{todayQs.length > 1 ? 's' : ''} added today</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {done ? (
            <Badge variant="done" dot>Done</Badge>
          ) : (
            <Badge variant="pending" dot>Pending</Badge>
          )}
          <Button
            size="sm"
            variant={done ? 'secondary' : 'primary'}
            onClick={onAdd}
            icon={<Plus size={13} />}
          >
            {done ? 'Add more' : 'Add entry'}
          </Button>
        </div>
      </div>
    </div>
  )
}
