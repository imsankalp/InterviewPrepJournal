const BASE = 'https://api.github.com'

function headers(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

// Encode JSON to base64 safely (handles Unicode)
function jsonToBase64(obj) {
  const json = JSON.stringify(obj, null, 2)
  const bytes = new TextEncoder().encode(json)
  const bin = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
  return btoa(bin)
}

// Decode base64 to JSON safely
function base64ToJson(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length).map((_, i) => bin.charCodeAt(i))
  const json = new TextDecoder().decode(bytes)
  return JSON.parse(json)
}

export async function getFile(token, repo, path) {
  const res = await fetch(`${BASE}/repos/${repo}/contents/${path}`, {
    headers: headers(token),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `GitHub API error ${res.status}`)
  }
  const data = await res.json()
  return {
    content: base64ToJson(data.content.replace(/\n/g, '')),
    sha: data.sha,
  }
}

export async function saveFile(token, repo, path, content, sha, message) {
  // If no SHA was supplied, check whether the file already exists and get its SHA.
  // GitHub requires the current SHA to update an existing file.
  if (!sha) {
    const existing = await getFile(token, repo, path)
    if (existing) sha = existing.sha
  }

  const body = {
    message,
    content: jsonToBase64(content),
  }
  if (sha) body.sha = sha

  const res = await fetch(`${BASE}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `GitHub API error ${res.status}`)
  }
  const data = await res.json()
  return data.content.sha
}

export async function verifyAccess(token, repo) {
  const res = await fetch(`${BASE}/repos/${repo}`, {
    headers: headers(token),
  })
  if (res.status === 404) throw new Error('Repository not found. Make sure the repo exists and the token has access.')
  if (res.status === 401) throw new Error('Invalid GitHub token. Please check your Personal Access Token.')
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Cannot access repository.')
  }
  return true
}

export async function createRepo(token, repoName) {
  const res = await fetch(`${BASE}/user/repos`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      name: repoName,
      private: true,
      description: 'Interview prep journal data',
      auto_init: true,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to create repository.')
  }
  const data = await res.json()
  return data.full_name
}

// Initialize all data files in repo if they don't exist
export async function initRepo(token, repo) {
  const files = {
    'data/tracks.json': [],
    'data/questions.json': [],
    'data/resources.json': [],
    'data/journals.json': [],
  }

  for (const [path, defaultContent] of Object.entries(files)) {
    const existing = await getFile(token, repo, path)
    if (!existing) {
      await saveFile(token, repo, path, defaultContent, null, 'Init: create data files')
    }
  }
}
