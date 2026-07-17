import { useEffect, useState } from 'react'
import {
  WORKS_PROJECTS,
  WORKS_STATUS,
  type WorksTabId,
} from '../data/worksProjects'
import {
  changelogRawUrl,
  fetchChangelogSections,
  type ChangelogSection,
} from '../data/parseChangelog'
import { ChangelogSectionView } from './ChangelogSectionView'

type WorksDetailProps = {
  projectId: string
  tab: WorksTabId
  onBack: () => void
}

/** Works 상세 — 진행현황 스냅샷 / 운영로그 목록 */
export function WorksDetail({ projectId, tab, onBack }: WorksDetailProps) {
  const title =
    tab === 'status' ? WORKS_STATUS.title : tab === 'ops' ? 'CHANGELOG' : '배포·운영 로그'
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

      {tab === 'status' ? <StatusBody /> : <OpsBody projectId={projectId} />}
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
  | { status: 'ok'; sections: ChangelogSection[] }
  | { status: 'fallback'; message: string }

/** 운영로그 — 카드별 CHANGELOG 본문 표시, 실패 시 안내 */
function OpsBody({ projectId }: { projectId: string }) {
  const [state, setState] = useState<OpsLoadState>({ status: 'loading' })
  const changelogFile =
    WORKS_PROJECTS.find((p) => p.id === projectId)?.changelogFile ??
    'regline-hub_CHANGELOG.md'

  useEffect(() => {
    let cancelled = false

    fetchChangelogSections(changelogRawUrl(changelogFile))
      .then((sections) => {
        if (cancelled) return
        if (sections.length === 0) {
          setState({
            status: 'fallback',
            message: 'CHANGELOG가 비어 있습니다. GitHub 레포를 확인하세요.',
          })
          return
        }
        setState({ status: 'ok', sections })
      })
      .catch(() => {
        if (cancelled) return
        setState({
          status: 'fallback',
          message: 'CHANGELOG를 불러오지 못했습니다. 네트워크 또는 GitHub 레포를 확인하세요.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [changelogFile])

  if (state.status === 'loading') {
    return (
      <div className="works-detail__body">
        <p className="works-detail__note" role="status">
          CHANGELOG 불러오는 중…
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
      {state.status === 'ok' && <ChangelogSectionView sections={state.sections} />}
      <p className="works-detail__note">
        <a
          href={`https://github.com/regline-dev/CHANGELOG/blob/main/${changelogFile}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub에서 보기
        </a>
        {state.status === 'ok' ? ` · ${changelogFile}` : null}
      </p>
    </div>
  )
}
