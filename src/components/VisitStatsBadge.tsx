import { useEffect, useState } from 'react'
import { recordHubVisit, type VisitStats } from '../data/visitCounter'

/** Projects 헤더 우측 — Visitors / Views 대략 합계 */
export function VisitStatsBadge() {
  const [stats, setStats] = useState<VisitStats | null>(null)

  useEffect(() => {
    let cancelled = false
    void recordHubVisit().then((next) => {
      if (!cancelled) setStats(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!stats) {
    return null
  }

  return (
    <p className="visit-stats" aria-label="방문 통계">
      <span>Visitors {stats.visitors}</span>
      <span className="visit-stats__sep" aria-hidden="true">
        /
      </span>
      <span>Views {stats.pageViews}</span>
    </p>
  )
}
