import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Target, BookOpen, Bookmark,
  BarChart2, BookMarked, LogOut, RefreshCw, CheckCircle, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/tracks', icon: Target, label: 'Tracks' },
  { to: '/questions', icon: BookOpen, label: 'Question Bank' },
  { to: '/resources', icon: Bookmark, label: 'Resources' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/journal', icon: BookMarked, label: 'Journal' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { syncStatus, syncFromGitHub } = useData()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">PT</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">PrepTrack</div>
            <div className="text-xs text-slate-500">Interview Journal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100',
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1">
        {/* Sync status */}
        {user?.githubRepo && (
          <button
            onClick={syncFromGitHub}
            disabled={syncStatus === 'syncing'}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw size={13} className="animate-spin text-indigo-500" />
            ) : syncStatus === 'error' ? (
              <AlertCircle size={13} className="text-rose-500" />
            ) : (
              <CheckCircle size={13} className="text-emerald-500" />
            )}
            <span className="truncate">
              {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'error' ? 'Sync failed' : user.githubRepo}
            </span>
          </button>
        )}

        {/* User + logout */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-indigo-700 text-xs font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-slate-700 font-medium flex-1 truncate">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
