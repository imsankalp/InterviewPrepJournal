import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import { Flame, Trophy, TrendingUp, BookOpen, Target, CheckCircle2 } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { calculateStreak, getLastNDays, TODAY, formatDate } from '../lib/dateUtils'
import { getCategoryStyle } from '../lib/utils'
import { format, parseISO } from 'date-fns'
import { cn } from '../lib/utils'

export function AnalyticsPage() {
  const { tracks, questions } = useData()
  const today = TODAY()
  const activeTracks = tracks.filter(t => t.isActive !== false)

  // ─── Streak (all active tracks must be done) ──────────────────
  const last180 = getLastNDays(180)
  const allDoneDays = last180.filter(d =>
    activeTracks.length > 0 && activeTracks.every(t =>
      questions.some(q => q.trackId === t.id && q.solvedDate === d)
    )
  )
  const { current: currentStreak, longest: longestStreak } = calculateStreak(allDoneDays)

  // ─── Per-track completion rates ───────────────────────────────
  const last30 = getLastNDays(30)
  const trackStats = activeTracks.map(t => {
    const doneDays = last30.filter(d => questions.some(q => q.trackId === t.id && q.solvedDate === d))
    const cat = getCategoryStyle(t.category)
    return {
      id: t.id,
      name: t.name,
      color: cat.color,
      done: doneDays.length,
      missed: 30 - doneDays.length,
      rate: Math.round((doneDays.length / 30) * 100),
      questions: questions.filter(q => q.trackId === t.id).length,
    }
  })

  // ─── Questions per day (last 30 days) ─────────────────────────
  const questionsPerDay = last30.map(date => ({
    date: format(parseISO(date), 'MMM d'),
    count: questions.filter(q => q.solvedDate === date).length,
  })).filter(d => d.count > 0)

  // ─── Questions by track (pie) ─────────────────────────────────
  const byTrack = tracks
    .map(t => ({
      name: t.name,
      value: questions.filter(q => q.trackId === t.id).length,
      color: getCategoryStyle(t.category).color,
    }))
    .filter(t => t.value > 0)

  // ─── Heatmap (last 60 days) ───────────────────────────────────
  const last60 = getLastNDays(60)
  const maxPerDay = Math.max(1, ...last60.map(d => questions.filter(q => q.solvedDate === d).length))

  // ─── Overall stats ────────────────────────────────────────────
  const totalDone = allDoneDays.length
  const overallRate = last30.length > 0
    ? Math.round((last30.filter(d => activeTracks.length > 0 && activeTracks.every(t =>
        questions.some(q => q.trackId === t.id && q.solvedDate === d)
      )).length / 30) * 100)
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Your preparation consistency and progress overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Flame size={18} className="text-orange-500" />} label="Current Streak" value={`${currentStreak}d`} color="orange" />
        <StatCard icon={<Trophy size={18} className="text-amber-500" />} label="Longest Streak" value={`${longestStreak}d`} color="amber" />
        <StatCard icon={<BookOpen size={18} className="text-indigo-500" />} label="Total Questions" value={questions.length} color="indigo" />
        <StatCard icon={<TrendingUp size={18} className="text-emerald-500" />} label="30d Completion" value={`${overallRate}%`} color="emerald" />
      </div>

      {/* Activity heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Activity — Last 60 Days</h2>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
          {last60.map(date => {
            const count = questions.filter(q => q.solvedDate === date).length
            const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxPerDay) * 4))
            const colors = ['bg-slate-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700']
            return (
              <div
                key={date}
                title={`${formatDate(date)}: ${count} question${count !== 1 ? 's' : ''}`}
                className={`aspect-square rounded-sm ${colors[intensity]}`}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
          <span>Less</span>
          {['bg-slate-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Questions per day chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Questions per Day</h2>
          {questionsPerDay.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={questionsPerDay} barSize={16}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={v => [`${v} questions`]}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Questions by track pie */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Questions by Track</h2>
          {byTrack.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byTrack} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {byTrack.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-track table */}
      {trackStats.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Track Performance — Last 30 Days</h2>
          <div className="space-y-3">
            {trackStats.map(t => (
              <div key={t.id} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <div className="w-36 text-sm font-medium text-slate-700 truncate">{t.name}</div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${t.rate}%`, backgroundColor: t.color }}
                    />
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-700 w-10 text-right">{t.rate}%</div>
                <div className="text-xs text-slate-400 w-24 text-right">{t.done}/{30} days · {t.questions}q</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    orange: 'bg-orange-50 border-orange-100',
    amber: 'bg-amber-50 border-amber-100',
    indigo: 'bg-indigo-50 border-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-100',
  }
  return (
    <div className={`bg-white border rounded-xl p-4 ${colorMap[color] || ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}
