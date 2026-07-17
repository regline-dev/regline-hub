import { useEffect, useState } from 'react'
import { WORKS_PROJECTS, type WorksTabId } from '../data/worksProjects'
import {
  fetchChangelogSections,
  type ChangelogSection,
} from '../data/parseChangelog'
import { fetchRawText } from '../data/fetchRawText'
import { ChangelogSectionView } from './ChangelogSectionView'
import { ReadmeView } from './ReadmeView'

type WorksPanelProps = {
  projectId: string
  tab: WorksTabId
}

/** Works 오른쪽 패널 — README.md / CHANGELOG.md */
export function WorksPanel({ projectId, tab }: WorksPanelProps) {
  const project = WORKS_PROJECTS.find((p) => p.id === projectId)
  const title =
    tab === 'status' ? 'README.md' : tab === 'ops' ? 'CHANGELOG.md' : '상세'
  const subtitle = project?.title ?? projectId

  return (
    <div className="works-panel">
      <header className="works-panel__header">
        <div className="works-panel__titles">
          <h2 className="works-panel__title">
            <span className="works-panel__title-name">{subtitle}</span>{' '}
            <span className="works-panel__title-tab">{title}</span>
          </h2>
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
  const project = WORKS_PROJECTS.find((p) => p.id === projectId)
  const changelogUrl = project?.changelogRawUrl

  useEffect(() => {
    let cancelled = false
    if (!changelogUrl) {
      setState({
        status: 'error',
        message: 'CHANGELOG URL이 설정되지 않았습니다.',
      })
      return
    }

    fetchChangelogSections(changelogUrl)
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
  }, [changelogUrl])

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

  // Raw URL → blob URL (GitHub에서 보기)
  const githubBlobUrl = changelogUrl
    ?.replace(
      'https://raw.githubusercontent.com/',
      'https://github.com/',
    )
    .replace('/main/', '/blob/main/')

  return (
    <div className="works-panel__scroll">
      <ChangelogSectionView sections={state.sections} />
      <p className="works-detail__note">
        {githubBlobUrl && (
          <a href={githubBlobUrl} target="_blank" rel="noopener noreferrer">
            GitHub에서 보기
          </a>
        )}
        {' · CHANGELOG.md'}
      </p>
    </div>
  )
}
