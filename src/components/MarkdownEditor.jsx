import { useState } from 'react'
import { Eye, Edit3, Columns } from 'lucide-react'
import { cn } from '../lib/utils'
import { MarkdownViewer } from './MarkdownViewer'

export function MarkdownEditor({ value, onChange, minHeight = 300, placeholder = 'Write your answer in Markdown...' }) {
  const [mode, setMode] = useState('write') // 'write' | 'preview' | 'split'

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex rounded-md overflow-hidden border border-slate-200 bg-white">
          {[
            { id: 'write', icon: Edit3, label: 'Write' },
            { id: 'split', icon: Columns, label: 'Split' },
            { id: 'preview', icon: Eye, label: 'Preview' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                mode === id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Markdown hints */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono">**bold**</span>
          <span className="font-mono">*italic*</span>
          <span className="font-mono">`code`</span>
          <span className="font-mono">```block```</span>
        </div>
      </div>

      {/* Editor area */}
      <div className={cn('flex', mode === 'split' && 'divide-x divide-slate-200')}>
        {(mode === 'write' || mode === 'split') && (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'flex-1 p-4 text-sm font-mono text-slate-900 bg-white placeholder-slate-400 resize-none focus:outline-none',
              mode === 'split' ? 'w-1/2' : 'w-full'
            )}
            style={{ minHeight }}
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className={cn('flex-1 p-4 overflow-auto', mode === 'split' && 'w-1/2')}
            style={{ minHeight }}
          >
            {value ? (
              <MarkdownViewer content={value} />
            ) : (
              <p className="text-sm text-slate-400 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
