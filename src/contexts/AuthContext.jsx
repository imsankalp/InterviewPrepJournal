import { createContext, useContext, useState, useEffect } from 'react'
import { getAuth, setAuth, clearAuth } from '../lib/storage'
import { hashPassword } from '../lib/utils'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getAuth()
    if (stored) setUser(stored)
    setLoading(false)
  }, [])

  async function signup({ username, password, githubToken, githubRepo }) {
    const hash = await hashPassword(password)
    const userData = {
      username,
      passwordHash: hash,
      githubToken,
      githubRepo,
      createdAt: new Date().toISOString(),
    }
    setAuth(userData)
    setUser(userData)
    return userData
  }

  async function login(username, password) {
    const stored = getAuth()
    if (!stored) throw new Error('No account found. Please sign up first.')
    if (stored.username !== username) throw new Error('Invalid username or password.')
    const hash = await hashPassword(password)
    if (stored.passwordHash !== hash) throw new Error('Invalid username or password.')
    setUser(stored)
    return stored
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  function updateGithubSettings(githubToken, githubRepo) {
    const updated = { ...user, githubToken, githubRepo }
    setAuth(updated)
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signup, login, logout, updateGithubSettings }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
