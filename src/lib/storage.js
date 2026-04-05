const KEYS = {
  AUTH: 'preptrack_auth',
  CACHE: 'preptrack_cache',
}

export function getAuth() {
  try {
    const raw = localStorage.getItem(KEYS.AUTH)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuth(auth) {
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(KEYS.AUTH)
}

export function getCache() {
  try {
    const raw = localStorage.getItem(KEYS.CACHE)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setCache(key, data, sha) {
  const cache = getCache()
  cache[key] = { data, sha, updatedAt: Date.now() }
  localStorage.setItem(KEYS.CACHE, JSON.stringify(cache))
}

export function getCacheEntry(key) {
  const cache = getCache()
  return cache[key] || { data: [], sha: null }
}

export function clearCache() {
  localStorage.removeItem(KEYS.CACHE)
}
