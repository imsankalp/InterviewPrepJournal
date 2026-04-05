import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getFile, saveFile } from '../lib/github'
import { getCacheEntry, setCache } from '../lib/storage'
import { generateId } from '../lib/utils'
import { TODAY } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const DataContext = createContext(null)

const FILES = {
  tracks: 'data/tracks.json',
  questions: 'data/questions.json',
  resources: 'data/resources.json',
  journals: 'data/journals.json',
}

export function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [tracks, setTracks] = useState([])
  const [questions, setQuestions] = useState([])
  const [resources, setResources] = useState([])
  const [journals, setJournals] = useState([])
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'error'
  const shaRef = useRef({})

  // Load from cache immediately, then sync from GitHub
  useEffect(() => {
    if (!isAuthenticated) return

    // Load from localStorage cache first (instant)
    const cachedTracks = getCacheEntry('tracks')
    const cachedQuestions = getCacheEntry('questions')
    const cachedResources = getCacheEntry('resources')
    const cachedJournals = getCacheEntry('journals')

    if (cachedTracks.data) setTracks(cachedTracks.data)
    if (cachedQuestions.data) setQuestions(cachedQuestions.data)
    if (cachedResources.data) setResources(cachedResources.data)
    if (cachedJournals.data) setJournals(cachedJournals.data)

    shaRef.current = {
      tracks: cachedTracks.sha,
      questions: cachedQuestions.sha,
      resources: cachedResources.sha,
      journals: cachedJournals.sha,
    }

    // Sync from GitHub in background
    syncFromGitHub()
  }, [isAuthenticated, user?.githubToken, user?.githubRepo])

  async function syncFromGitHub() {
    if (!user?.githubToken || !user?.githubRepo) return
    setSyncStatus('syncing')
    try {
      const [t, q, r, j] = await Promise.all([
        getFile(user.githubToken, user.githubRepo, FILES.tracks),
        getFile(user.githubToken, user.githubRepo, FILES.questions),
        getFile(user.githubToken, user.githubRepo, FILES.resources),
        getFile(user.githubToken, user.githubRepo, FILES.journals),
      ])

      if (t) { setTracks(t.content); setCache('tracks', t.content, t.sha); shaRef.current.tracks = t.sha }
      if (q) { setQuestions(q.content); setCache('questions', q.content, q.sha); shaRef.current.questions = q.sha }
      if (r) { setResources(r.content); setCache('resources', r.content, r.sha); shaRef.current.resources = r.sha }
      if (j) { setJournals(j.content); setCache('journals', j.content, j.sha); shaRef.current.journals = j.sha }

      setSyncStatus('idle')
    } catch (err) {
      setSyncStatus('error')
      console.error('GitHub sync error:', err)
    }
  }

  async function saveToGitHub(key, data, message) {
    if (!user?.githubToken || !user?.githubRepo) return
    try {
      // Pass the cached SHA; saveFile will auto-fetch it if null/stale
      const newSha = await saveFile(
        user.githubToken,
        user.githubRepo,
        FILES[key],
        data,
        shaRef.current[key] || null,
        message
      )
      shaRef.current[key] = newSha
      setCache(key, data, newSha)
    } catch (err) {
      console.error(`Failed to save ${key} to GitHub:`, err)
      // If it looks like a SHA conflict, clear the cached SHA and show a helpful message
      if (err.message?.toLowerCase().includes('sha') || err.message?.toLowerCase().includes('conflict')) {
        shaRef.current[key] = null
        toast.error('Sync conflict — please refresh the page and try again.')
      } else {
        toast.error(`Failed to sync to GitHub: ${err.message}`)
      }
    }
  }

  // ─── Tracks ───────────────────────────────────────────────────
  async function addTrack(trackData) {
    const track = { id: generateId(), createdAt: new Date().toISOString(), ...trackData }
    const updated = [...tracks, track]
    setTracks(updated)
    setCache('tracks', updated, shaRef.current.tracks)
    await saveToGitHub('tracks', updated, `Add track: ${track.name}`)
    return track
  }

  async function updateTrack(id, updates) {
    const updated = tracks.map(t => t.id === id ? { ...t, ...updates } : t)
    setTracks(updated)
    setCache('tracks', updated, shaRef.current.tracks)
    await saveToGitHub('tracks', updated, `Update track: ${id}`)
  }

  async function deleteTrack(id) {
    const updated = tracks.filter(t => t.id !== id)
    setTracks(updated)
    setCache('tracks', updated, shaRef.current.tracks)
    await saveToGitHub('tracks', updated, `Delete track: ${id}`)
  }

  // ─── Questions ────────────────────────────────────────────────
  async function addQuestion(questionData) {
    const question = {
      id: generateId(),
      solvedDate: TODAY(),
      createdAt: new Date().toISOString(),
      ...questionData,
    }
    const updated = [...questions, question]
    setQuestions(updated)
    setCache('questions', updated, shaRef.current.questions)
    await saveToGitHub('questions', updated, `Add question: ${question.title}`)
    return question
  }

  async function updateQuestion(id, updates) {
    const updated = questions.map(q => q.id === id ? { ...q, ...updates } : q)
    setQuestions(updated)
    setCache('questions', updated, shaRef.current.questions)
    await saveToGitHub('questions', updated, `Update question: ${id}`)
  }

  async function deleteQuestion(id) {
    const updated = questions.filter(q => q.id !== id)
    setQuestions(updated)
    setCache('questions', updated, shaRef.current.questions)
    await saveToGitHub('questions', updated, `Delete question: ${id}`)
  }

  // ─── Resources ────────────────────────────────────────────────
  async function addResource(resourceData) {
    const resource = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...resourceData,
    }
    const updated = [...resources, resource]
    setResources(updated)
    setCache('resources', updated, shaRef.current.resources)
    await saveToGitHub('resources', updated, `Add resource: ${resource.title}`)
    return resource
  }

  async function updateResource(id, updates) {
    const updated = resources.map(r => r.id === id ? { ...r, ...updates } : r)
    setResources(updated)
    setCache('resources', updated, shaRef.current.resources)
    await saveToGitHub('resources', updated, `Update resource: ${id}`)
  }

  async function deleteResource(id) {
    const updated = resources.filter(r => r.id !== id)
    setResources(updated)
    setCache('resources', updated, shaRef.current.resources)
    await saveToGitHub('resources', updated, `Delete resource: ${id}`)
  }

  // ─── Journals ─────────────────────────────────────────────────
  async function saveJournal(date, notes) {
    const existing = journals.find(j => j.date === date)
    let updated
    if (existing) {
      updated = journals.map(j => j.date === date ? { ...j, notes, updatedAt: new Date().toISOString() } : j)
    } else {
      updated = [...journals, { id: generateId(), date, notes, updatedAt: new Date().toISOString() }]
    }
    setJournals(updated)
    setCache('journals', updated, shaRef.current.journals)
    await saveToGitHub('journals', updated, `Journal entry: ${date}`)
  }

  function getJournal(date) {
    return journals.find(j => j.date === date) || null
  }

  // ─── Derived helpers ─────────────────────────────────────────
  function isDoneForDate(trackId, date) {
    return questions.some(q => q.trackId === trackId && q.solvedDate === date)
  }

  function getQuestionsForDate(trackId, date) {
    return questions.filter(q => q.trackId === trackId && q.solvedDate === date)
  }

  function getQuestionsForTrack(trackId) {
    return questions.filter(q => q.trackId === trackId)
  }

  return (
    <DataContext.Provider value={{
      tracks, questions, resources, journals,
      syncStatus, syncFromGitHub,
      addTrack, updateTrack, deleteTrack,
      addQuestion, updateQuestion, deleteQuestion,
      addResource, updateResource, deleteResource,
      saveJournal, getJournal,
      isDoneForDate, getQuestionsForDate, getQuestionsForTrack,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
