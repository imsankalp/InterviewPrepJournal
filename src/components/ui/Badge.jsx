import { cn } from '../../lib/utils'

export function Badge({ children, variant = 'default', className, dot }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    violet: 'bg-violet-100 text-violet-700',
    pink: 'bg-pink-100 text-pink-700',
    done: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    missed: 'bg-rose-100 text-rose-700',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant] || variants.default,
      className
    )}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-emerald-500': variant === 'done' || variant === 'emerald',
          'bg-amber-500': variant === 'pending' || variant === 'amber',
          'bg-rose-500': variant === 'missed' || variant === 'rose',
          'bg-indigo-500': variant === 'indigo',
          'bg-slate-400': variant === 'default',
        })} />
      )}
      {children}
    </span>
  )
}
