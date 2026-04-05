import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Save } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { getCategoryStyle } from '../lib/utils'
import { TODAY, formatDate, isDateToday, isDateFuture } from '../lib/dateUtils'
import { format, parseISO, subDays, addDays } from 'date-fns'
import toast from 'react-hot-toast'

export function JournalPage() {
  const { tracks, questions, journals, saveJournal, isDoneForDate, getQuestionsForDate } = useData()
  const navigate = useNavigate()
  const [date, setDate] = useState(TODAY())
  const [notes, setNotes] = useState(() => {
    const j = journals.find(j => j.date === TODAY())
    return j?.notes || ''
  })
  const [saving, setSaving] = useState(false)

  const activeTracks = tracks.filter(t => t.isActive !== false)
  const isToday = isDateToday(date)
  const isFuture = isDateFuture(date)

  function goTo(newDate) {
    setDate(newDate)
    const j = journals.find(j => j.date === newDate)
    setNotes(j?.notes || '')
  }

  function prevDay() {
    goTo(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))
  }

  function nextDay() {
    const next = format(addDays(parseISO(date), 1), 'yyyy-MM-dd')
    if (next <= TODAY()) goTo(next)
  }

  async function handleSaveNotes() {
    setSaving(true)
    try {
      await saveJournal(date, notes)
      toast.success('Notes saved.')
    } catch {
      toast.error('Failed to save notes.')
    } finally {
      setSaving(false)
    }
  }

  const dayQuestions = questions.filter(q => q.solvedDate === date)
  const dayStats = {
    done: activeTracks.filter(t => isDoneForDate(t.id, date)).length,
    total: activeTracks.length,
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Journal</h1>
        <p className="text-sm text-slate-500 mt-1">Review your daily preparation history</p>
      </div>

      {/* Date navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between">
          <button
            onClick={prevDay}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <div className="text-base font-semibold text-slate-900">
              {format(parseISO(date), 'EEEE, MMMM d')}
            </div>
            <div className="text-sm text-slate-500">
              {format(parseISO(date), 'yyyy')}
              {isToday && <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Today</span>}
            </div>
          </div>

          <button
            onClick={nextDay}
            disabled={isToday}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Date picker */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-3">
          <input
            type="date"
            value={date}
            max={TODAY()}
            onChange={e => goTo(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
          <button
            onClick={() => goTo(TODAY())}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Today
          </button>
        </div>
      </div>

      {isFuture ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Future dates are not yet available.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Day summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">Track Summary</h2>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                dayStats.done === dayStats.total && dayStats.total > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : dayStats.done > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {dayStats.done} / {dayStats.total} done
              </span>
            </div>

            {activeTracks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No tracks configured.</p>
            ) : (
              <div className="space-y-2">
                {activeTracks.map(track => {
                  const done = isDoneForDate(track.id, date)
                  const trackQs = getQuestionsForDate(track.id, date)
                  const cat = getCategoryStyle(track.category)
                  return (
                    <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{track.name}</span>
                          {done ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <XCircle size={14} className="text-rose-400" />
                          )}
                        </div>
                        {trackQs.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {trackQs.map(q => (
                              <button
                                key={q.id}
                                onClick={() => navigate(`/questions/${q.id}`)}
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                              >
                                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                {q.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {trackQs.length} question{trackQs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Questions added */}
          {dayQuestions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Questions Added ({dayQuestions.length})
              </h2>
              <div className="space-y-1.5">
                {dayQuestions.map(q => {
                  const track = tracks.find(t => t.id === q.trackId)
                  const cat = getCategoryStyle(track?.category)
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigate(`/questions/${q.id}`)}
                      className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color }} />
                      <span className="text-sm text-slate-700 group-hover:text-indigo-700 flex-1 truncate">{q.title}</span>
                      {track && <span className={`text-xs px-1.5 py-0.5 rounded ${cat?.bg} ${cat?.text} shrink-0`}>{track.name}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Notes</h2>
              <Button size="sm" variant="secondary" onClick={handleSaveNotes} loading={saving} icon={<Save size={13} />}>
                Save
              </Button>
            </div>
            <Textarea
              placeholder="How did your session go today? Any observations or reflections..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
            />
          </div>
        </div>
      )}
    </div>
  )
}
