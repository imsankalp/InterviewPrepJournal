import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return crypto.randomUUID()
}

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const TRACK_CATEGORIES = [
  { id: 'javascript', label: 'JavaScript', color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'machine-coding', label: 'Machine Coding', color: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  { id: 'react', label: 'React / React Native', color: '#06b6d4', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { id: 'behavioral', label: 'Behavioral', color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'dsa', label: 'DSA', color: '#ec4899', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { id: 'system-design', label: 'System Design', color: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  { id: 'custom', label: 'Custom', color: '#64748b', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
]

export function getCategoryStyle(categoryId) {
  return TRACK_CATEGORIES.find(c => c.id === categoryId) || TRACK_CATEGORIES[TRACK_CATEGORIES.length - 1]
}

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', className: 'bg-emerald-100 text-emerald-700' },
  { id: 'medium', label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  { id: 'hard', label: 'Hard', className: 'bg-rose-100 text-rose-700' },
]

export const RESOURCE_SOURCES = [
  { id: 'claude', label: 'Claude' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'article', label: 'Article' },
  { id: 'video', label: 'Video' },
  { id: 'other', label: 'Other' },
]
