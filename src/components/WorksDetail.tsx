import { useEffect, useState } from 'react'
import { WORKS_OPS_LOG, WORKS_STATUS, type WorksTabId } from '../data/worksProjects'
import {
  fetchChangelogOps,
  type ChangelogOpsEntry,
  REGLINE_HUB_CHANGELOG_RAW_URL,
} from '../data/parseChangelog'

type WorksDetailProps = {
  tab: WorksTabId
  onBack: () => void
}

/** Works 상세 — 진행현황 스냅샷 / 운영로그 목록 */
export function WorksDetail({ tab, onBack }: WorksDetailProps) {
  const title = tab === 'status' ? WORKS_STATUS.title : '배포·운영 로그'
  const badge = tab === 'status' ? WORKS_STATUS.badge : undefined

  return (
    <div className="works-detail">
      <header className="works-detail__header">
        <button type="button" className="works-detail__back" onClick={onBack}>
          ← 뒤로
        </button>
        <h1 className="works-detail__title">{title}</h1>
        {badge && <span className="works-detail__badge">{badge}</span>}
      </header>

      {tab === 'status' ? <StatusBody /> : <OpsBody />}
    </div>
  )
}

function StatusBody() {
  return (
    <div className="works-detail__body">
      <section className="works-detail__section">
        <h2 className="works-detail__section-title">현재 상태</h2>
        <ul className="works-detail__list">
          {WORKS_STATUS.current.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="works-detail__section">
        <h2 className="works-detail__section-title">구조도</h2>
        <p className="works-detail__note">
          RAG 파이프라인 · 에이전트 Tool 루프 다이어그램은 Docs 부록을 참고하세요.
        </p>
      </section>

      <section className="works-detail__section">
        <h2 className="works-detail__section-title">다음 작업</h2>
        <ul className="works-detail__list">
          {WORKS_STATUS.next.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="works-detail__section">
        <h2 className="works-detail__section-title">관련 문서</h2>
        <ul className="works-detail__list">
          {WORKS_STATUS.docs.map((doc) => (
            <li key={doc.label}>
              {doc.href === '#' ? (
                <span>{doc.label}</span>
              ) : (
                <a href={doc.href} target="_blank" rel="noopener noreferrer">
                  {doc.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

type OpsLoadState =
  | { status: 'loading' }
  | { status: 'ok'; entries: ChangelogOpsEntry[]; fromRemote: true }
  | { status: 'fallback'; entries: ChangelogOpsEntry[]; message: string }

/** 운영로그 — GitHub CHANGELOG Raw 조회, 실패 시 stub 폴백 */
function OpsBody() {
  const [state, setState] = useState<OpsLoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetchChangelogOps()
      .then((entries) => {
        if (cancelled) return
        if (entries.length === 0) {
          setState({
            status: 'fallback',
            entries: WORKS_OPS_LOG,
            message: 'CHANGELOG가 비어 있어 로컬 로그를 표시합니다.',
          })
          return
        }
        setState({ status: 'ok', entries, fromRemote: true })
      })
      .catch(() => {
        if (cancelled) return
        setState({
          status: 'fallback',
          entries: WORKS_OPS_LOG,
          message: 'CHANGELOG를 불러오지 못해 로컬 로그를 표시합니다.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="works-detail__body">
        <p className="works-detail__note" role="status">
          운영로그 불러오는 중…
        </p>
      </div>
    )
  }

  return (
    <div className="works-detail__body">
      {state.status === 'fallback' && (
        <p className="works-detail__note" role="status">
          {state.message}
        </p>
      )}
      <ul className="works-detail__ops">
        {state.entries.map((entry) => (
          <li key={`${entry.date}-${entry.text}`} className="works-detail__ops-item">
            <span className="works-detail__ops-date">{entry.date}</span>
            <span className="works-detail__ops-text">{entry.text}</span>
          </li>
        ))}
      </ul>
      <p className="works-detail__note">
        <a
          href="https://github.com/regline-dev/CHANGELOG"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub CHANGELOG
        </a>
        {state.status === 'ok' ? ' · Raw 동기화' : null}
      </p>
      {/* Raw URL은 디버그용으로 상수만 참조 — 화면에는 노출하지 않음 */}
      <span hidden data-changelog-url={REGLINE_HUB_CHANGELOG_RAW_URL} />
    </div>
  )
}
