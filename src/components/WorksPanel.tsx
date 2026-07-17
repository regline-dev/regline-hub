import { useEffect, useState } from 'react'
import { WORKS_PROJECTS, type WorksTabId } from '../data/worksProjects'
import {
  changelogRawUrl,
  fetchChangelogSections,
  type ChangelogSection,
} from '../data/parseChangelog'
import { fetchRawText } from '../data/fetchRawText'
import { ChangelogSectionView } from './ChangelogSectionView'
import { ReadmeView } from './ReadmeView'

type WorksPanelProps = {
  projectId: string
  tab: WorksTabId
  onClear: () => void
}

/** Works 오른쪽 패널 — 진행현황(README) / 운영로그(CHANGELOG) */
export function WorksPanel({ projectId, tab, onClear }: WorksPanelProps) {
  const project = WORKS_PROJECTS.find((p) => p.id === projectId)
  const title =
    tab === 'status' ? '진행현황' : tab === 'ops' ? '운영로그' : '상세'
  const subtitle = project?.title ?? projectId

  return (
    <div className="works-panel">
      <header className="works-panel__header">
        <button type="button" className="works-panel__clear" onClick={onClear}>
          선택 해제
        </button>
        <div className="works-panel__titles">
          <h2 className="works-panel__title">{title}</h2>
          <p className="works-panel__subtitle">{subtitle}</p>
        </div>
      </header>

      {tab === 'status' ? (
        <StatusPanel projectId={projectId} />
      ) : (
        <OpsPanel projectId={projectId} />
      )}
    </div>
  )
}

function StatusPanel({ projectId }: { projectId: string }) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'ok'; markdown: string } | { status: 'error'; message: string }
  >({ status: 'loading' })
  const readmeUrl = WORKS_PROJECTS.find((p) => p.id === projectId)?.readmeRawUrl

  useEffect(() => {
    let cancelled = false
    if (!readmeUrl) {
      setState({ status: 'error', message: 'README URL이 설정되지 않았습니다.' })
      return
    }

    fetchRawText(readmeUrl)
      .then((markdown) => {
        if (!cancelled) setState({ status: 'ok', markdown })
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: 'README를 불러오지 못했습니다. 네트워크 또는 Raw URL을 확인하세요.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [readmeUrl])

  if (state.status === 'loading') {
    return (
      <p className="works-detail__note" role="status">
        README 불러오는 중…
      </p>
    )
  }
  if (state.status === 'error') {
    return (
      <p className="works-detail__note" role="status">
        {state.message}
      </p>
    )
  }

  return (
    <div className="works-panel__scroll">
      <ReadmeView markdown={state.markdown} />
      {readmeUrl && (
        <p className="works-detail__note">
          <a href={readmeUrl} target="_blank" rel="noopener noreferrer">
            Raw README
          </a>
        </p>
      )}
    </div>
  )
}

function OpsPanel({ projectId }: { projectId: string }) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'ok'; sections: ChangelogSection[] }
    | { status: 'error'; message: string }
  >({ status: 'loading' })
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
            status: 'error',
            message: 'CHANGELOG가 비어 있습니다. GitHub 레포를 확인하세요.',
          })
          return
        }
        setState({ status: 'ok', sections })
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: 'CHANGELOG를 불러오지 못했습니다. 네트워크 또는 GitHub 레포를 확인하세요.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [changelogFile])

  if (state.status === 'loading') {
    return (
      <p className="works-detail__note" role="status">
        CHANGELOG 불러오는 중…
      </p>
    )
  }
  if (state.status === 'error') {
    return (
      <p className="works-detail__note" role="status">
        {state.message}
      </p>
    )
  }

  return (
    <div className="works-panel__scroll">
      <ChangelogSectionView sections={state.sections} />
      <p className="works-detail__note">
        <a
          href={`https://github.com/regline-dev/CHANGELOG/blob/main/${changelogFile}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub에서 보기
        </a>
        {` · ${changelogFile}`}
      </p>
    </div>
  )
}
