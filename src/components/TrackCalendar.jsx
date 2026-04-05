import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getDaysInMonth, getMonthStartPadding, getMonthLabel,
  prevMonth, nextMonth, currentMonthStr,
  isDateToday, isDateFuture
} from '../lib/dateUtils'
import { cn } from '../lib/utils'
import { format } from 'date-fns'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TrackCalendar({ trackId, questions, trackCreatedAt }) {
  const [month, setMonth] = useState(currentMonthStr())

  const days = getDaysInMonth(month)
  const padding = getMonthStartPadding(month)
  const createdDate = trackCreatedAt ? trackCreatedAt.split('T')[0] : '2020-01-01'

  function getDayStatus(dateStr) {
    if (dateStr < createdDate) return 'before'
    if (isDateFuture(dateStr) && !isDateToday(dateStr)) return 'future'
    const done = questions.some(q => q.solvedDate === dateStr)
    if (isDateToday(dateStr)) return done ? 'done' : 'today'
    return done ? 'done' : 'missed'
  }

  const statusStyles = {
    done: 'bg-emerald-500 text-white font-medium hover:bg-emerald-600',
    missed: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
    today: 'bg-amber-100 text-amber-700 ring-2 ring-amber-400 font-semibold hover:bg-amber-200',
    future: 'bg-slate-50 text-slate-400 cursor-default',
    before: 'bg-transparent text-slate-300 cursor-default',
  }

  const canGoNext = month < currentMonthStr()

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth(prevMonth(month))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-700">{getMonthLabel(month)}</span>
        <button
          onClick={() => setMonth(nextMonth(month))}
          disabled={!canGoNext}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding */}
        {Array.from({ length: padding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {/* Days */}
        {days.map(dateStr => {
          const status = getDayStatus(dateStr)
          const day = parseInt(dateStr.split('-')[2])
          return (
            <div
              key={dateStr}
              title={`${dateStr} — ${status === 'done' ? 'Done' : status === 'missed' ? 'Missed' : status === 'today' ? 'Today (pending)' : ''}`}
              className={cn(
                'aspect-square flex items-center justify-center text-xs rounded-lg transition-colors',
                statusStyles[status]
              )}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
        {[
          { color: 'bg-emerald-500', label: 'Done' },
          { color: 'bg-rose-100 border border-rose-200', label: 'Missed' },
          { color: 'bg-amber-100 border border-amber-300', label: 'Today' },
          { color: 'bg-slate-100', label: 'Future' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-sm', color)} />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
