/** 방문 합계 — 정확도보다 “왔는지” 표시용 */

export type VisitStats = {
  visitors: number
  pageViews: number
}

export const VISIT_SESSION_KEY = 'regline-hub-visit-session'

export const EMPTY_VISIT_STATS: VisitStats = {
  visitors: 0,
  pageViews: 0,
}

/** pageViews는 항상 +1, visitors는 새 세션일 때만 +1 */
export function applyVisit(
  current: VisitStats,
  isNewVisitor: boolean,
): VisitStats {
  const visitors = Math.max(0, Number(current.visitors) || 0)
  const pageViews = Math.max(0, Number(current.pageViews) || 0)
  return {
    visitors: visitors + (isNewVisitor ? 1 : 0),
    pageViews: pageViews + 1,
  }
}

export function parseVisitStats(value: unknown): VisitStats {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_VISIT_STATS }
  }
  const record = value as Record<string, unknown>
  return {
    visitors: Math.max(0, Number(record.visitors) || 0),
    pageViews: Math.max(0, Number(record.pageViews) || 0),
  }
}

/**
 * 세션당 1회 visitors 증가. API 실패 시 null.
 */
export async function recordHubVisit(
  fetchImpl: typeof fetch = fetch,
  storage: Pick<Storage, 'getItem' | 'setItem'> | null = null,
): Promise<VisitStats | null> {
  const store =
    storage ??
    (typeof sessionStorage !== 'undefined' ? sessionStorage : null)
  const isNewVisitor = !store?.getItem(VISIT_SESSION_KEY)

  try {
    const response = await fetchImpl('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isNewVisitor }),
    })
    if (!response.ok) {
      return null
    }
    const data: unknown = await response.json()
    const stats = parseVisitStats(data)
    if (isNewVisitor) {
      store?.setItem(VISIT_SESSION_KEY, '1')
    }
    return stats
  } catch {
    return null
  }
}
