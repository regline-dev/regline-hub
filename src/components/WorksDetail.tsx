import { WORKS_OPS_LOG, WORKS_STATUS, type WorksTabId } from '../data/worksProjects'

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

function OpsBody() {
  return (
    <div className="works-detail__body">
      <ul className="works-detail__ops">
        {WORKS_OPS_LOG.map((entry) => (
          <li key={`${entry.date}-${entry.text}`} className="works-detail__ops-item">
            <span className="works-detail__ops-date">{entry.date}</span>
            <span className="works-detail__ops-text">{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
