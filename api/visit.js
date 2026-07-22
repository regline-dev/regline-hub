/**
 * 방문 합계 API — GitHub visits-data 브랜치의 visits.json 누적
 * 환경변수: VISIT_GITHUB_TOKEN (필수), OWNER/REPO/BRANCH/PATH 선택
 */

function applyVisit(current, isNewVisitor) {
  const visitors = Math.max(0, Number(current.visitors) || 0)
  const pageViews = Math.max(0, Number(current.pageViews) || 0)
  return {
    visitors: visitors + (isNewVisitor ? 1 : 0),
    pageViews: pageViews + 1,
  }
}

function parseVisitStats(value) {
  if (!value || typeof value !== 'object') {
    return { visitors: 0, pageViews: 0 }
  }
  return {
    visitors: Math.max(0, Number(value.visitors) || 0),
    pageViews: Math.max(0, Number(value.pageViews) || 0),
  }
}

function getConfig() {
  const token = process.env.VISIT_GITHUB_TOKEN || ''
  return {
    token,
    owner: process.env.VISIT_GITHUB_OWNER || 'regline-dev',
    repo: process.env.VISIT_GITHUB_REPO || 'regline-hub',
    branch: process.env.VISIT_GITHUB_BRANCH || 'visits-data',
    path: process.env.VISIT_GITHUB_PATH || 'visits.json',
  }
}

async function githubJson(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  })
  return response
}

async function ensureBranch(config) {
  const { token, owner, repo, branch } = config
  const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`
  const existing = await githubJson(refUrl, token)
  if (existing.ok) {
    return
  }
  if (existing.status !== 404) {
    throw new Error(`브랜치 조회 실패: HTTP ${existing.status}`)
  }

  const mainRef = await githubJson(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
    token,
  )
  if (!mainRef.ok) {
    throw new Error(`main 브랜치 조회 실패: HTTP ${mainRef.status}`)
  }
  const mainBody = await mainRef.json()
  const sha = mainBody?.object?.sha
  if (!sha) {
    throw new Error('main SHA를 찾을 수 없습니다.')
  }

  const created = await githubJson(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha,
      }),
    },
  )
  if (!created.ok && created.status !== 422) {
    throw new Error(`브랜치 생성 실패: HTTP ${created.status}`)
  }
}

async function readVisitFile(config) {
  const { token, owner, repo, branch, path } = config
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`
  const response = await githubJson(url, token)
  if (response.status === 404) {
    return { stats: { visitors: 0, pageViews: 0 }, sha: null }
  }
  if (!response.ok) {
    throw new Error(`visits.json 조회 실패: HTTP ${response.status}`)
  }
  const body = await response.json()
  const decoded = Buffer.from(body.content || '', 'base64').toString('utf8')
  let parsed
  try {
    parsed = JSON.parse(decoded)
  } catch {
    parsed = { visitors: 0, pageViews: 0 }
  }
  return { stats: parseVisitStats(parsed), sha: body.sha || null }
}

async function writeVisitFile(config, stats, sha) {
  const { token, owner, repo, branch, path } = config
  const content = Buffer.from(
    `${JSON.stringify(stats, null, 2)}\n`,
    'utf8',
  ).toString('base64')
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`
  const payload = {
    message: `chore: visit counter ${stats.visitors}/${stats.pageViews}`,
    content,
    branch,
  }
  if (sha) {
    payload.sha = sha
  }
  const response = await githubJson(url, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`visits.json 저장 실패: HTTP ${response.status} ${text}`)
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const config = getConfig()
  if (!config.token) {
    res.status(503).json({ error: 'VISIT_GITHUB_TOKEN 미설정' })
    return
  }

  try {
    if (req.method === 'GET') {
      await ensureBranch(config)
      const { stats } = await readVisitFile(config)
      res.status(200).json(stats)
      return
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      const isNewVisitor = Boolean(body.isNewVisitor)

      await ensureBranch(config)
      const { stats: current, sha } = await readVisitFile(config)
      const next = applyVisit(current, isNewVisitor)

      try {
        await writeVisitFile(config, next, sha)
      } catch (error) {
        // 동시 쓰기 충돌 시 한 번 재시도 (부정확 허용)
        const retry = await readVisitFile(config)
        const retried = applyVisit(retry.stats, isNewVisitor)
        await writeVisitFile(config, retried, retry.sha)
        res.status(200).json(retried)
        return
      }

      res.status(200).json(next)
      return
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS')
    res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    res.status(500).json({ error: message })
  }
}
