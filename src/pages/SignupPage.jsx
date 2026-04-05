import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Github, Key, ArrowRight, ArrowLeft, Check, ExternalLink } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { verifyAccess, initRepo, saveFile } from '../lib/github'
import { setCache } from '../lib/storage'
import { TRACK_CATEGORIES, generateId } from '../lib/utils'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

const PRESET_TRACKS = [
  { name: 'JavaScript Problems', category: 'javascript', description: 'Daily JS problem solving — closures, async, prototypes, etc.' },
  { name: 'Machine Coding', category: 'machine-coding', description: 'Build UI components from scratch within a time limit.' },
  { name: 'React / React Native', category: 'react', description: 'Theory, hooks, patterns, performance, and architecture.' },
  { name: 'Behavioral Questions', category: 'behavioral', description: 'STAR-method answers for common interview questions.' },
]

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: credentials, 2: github, 3: tracks
  const [loading, setLoading] = useState(false)
  const [selectedTracks, setSelectedTracks] = useState([0, 1, 2, 3])

  const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' })
  const [github, setGithub] = useState({ token: '', repo: '' })

  async function handleCredentials(e) {
    e.preventDefault()
    if (!credentials.username.trim()) return toast.error('Username is required.')
    if (credentials.password.length < 6) return toast.error('Password must be at least 6 characters.')
    if (credentials.password !== credentials.confirmPassword) return toast.error('Passwords do not match.')
    setStep(2)
  }

  async function handleGithub(e) {
    e.preventDefault()
    if (!github.token || !github.repo) return toast.error('Both GitHub token and repo are required.')
    if (!github.repo.includes('/')) return toast.error('Repo must be in format: username/repo-name')
    setLoading(true)
    try {
      await verifyAccess(github.token, github.repo)
      toast.success('GitHub connection verified!')
      setStep(3)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFinish() {
    setLoading(true)
    try {
      const user = await signup({
        username: credentials.username,
        password: credentials.password,
        githubToken: github.token,
        githubRepo: github.repo,
      })

      // Initialize GitHub repo data files
      await initRepo(github.token, github.repo)

      // Save selected tracks directly to GitHub
      const tracksToCreate = selectedTracks.map(i => ({
        id: generateId(),
        ...PRESET_TRACKS[i],
        createdAt: new Date().toISOString(),
        isActive: true,
      }))

      await saveFile(github.token, github.repo, 'data/tracks.json', tracksToCreate, null, 'Init: create tracks')
      setCache('tracks', tracksToCreate, null)

      toast.success('Account created! Welcome to PrepTrack 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleTrack(i) {
    setSelectedTracks(prev =>
      prev.includes(i) ? prev.filter(t => t !== i) : [...prev, i]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <span className="text-white text-xl font-bold">PT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Set up your interview prep journal</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6 px-1">
          {['Account', 'GitHub', 'Tracks'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
                step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              )}>
                {step > i + 1 ? <Check size={13} /> : i + 1}
              </div>
              <span className={cn('text-xs font-medium', step === i + 1 ? 'text-slate-700' : 'text-slate-400')}>{label}</span>
              {i < 2 && <div className={cn('flex-1 h-px', step > i + 1 ? 'bg-emerald-300' : 'bg-slate-200')} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Step 1: Credentials */}
          {step === 1 && (
            <form onSubmit={handleCredentials} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="your-username"
                value={credentials.username}
                onChange={e => setCredentials(f => ({ ...f, username: e.target.value }))}
                icon={<User size={15} />}
                required
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={credentials.password}
                onChange={e => setCredentials(f => ({ ...f, password: e.target.value }))}
                icon={<Lock size={15} />}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                value={credentials.confirmPassword}
                onChange={e => setCredentials(f => ({ ...f, confirmPassword: e.target.value }))}
                icon={<Lock size={15} />}
                required
              />
              <Button type="submit" className="w-full" size="lg" icon={<ArrowRight size={15} />}>
                Continue
              </Button>
            </form>
          )}

          {/* Step 2: GitHub */}
          {step === 2 && (
            <form onSubmit={handleGithub} className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-700 space-y-1.5">
                <p className="font-semibold">GitHub Setup</p>
                <p>Your data will be stored as JSON files in a GitHub repo. You'll need:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>A <strong>Personal Access Token</strong> with <code className="bg-indigo-100 px-1 rounded">repo</code> scope</li>
                  <li>An empty <strong>GitHub repository</strong> (private is fine)</li>
                </ol>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=PrepTrack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline font-medium"
                >
                  Create token on GitHub <ExternalLink size={11} />
                </a>
              </div>

              <Input
                label="Personal Access Token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={github.token}
                onChange={e => setGithub(f => ({ ...f, token: e.target.value }))}
                icon={<Key size={15} />}
                required
              />
              <Input
                label="Repository (username/repo-name)"
                type="text"
                placeholder="johndoe/interview-prep-data"
                value={github.repo}
                onChange={e => setGithub(f => ({ ...f, repo: e.target.value }))}
                icon={<Github size={15} />}
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} size="lg" icon={<ArrowLeft size={15} />}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" loading={loading} size="lg">
                  Verify & Continue
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Tracks */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Select the preparation tracks you want to track daily. You can add more later.
              </p>
              <div className="space-y-2">
                {PRESET_TRACKS.map((track, i) => {
                  const selected = selectedTracks.includes(i)
                  const cat = TRACK_CATEGORIES.find(c => c.id === track.category)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleTrack(i)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl border-2 transition-all',
                        selected ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                          style={{ backgroundColor: cat?.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800">{track.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{track.description}</div>
                        </div>
                        {selected && <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} size="lg" icon={<ArrowLeft size={15} />}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  loading={loading}
                  onClick={handleFinish}
                  disabled={selectedTracks.length === 0}
                  size="lg"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
