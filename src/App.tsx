import { useEffect, useState, type ReactElement } from 'react'
import { LinksPanel } from './components/LinksPanel'
import { ProjectCard } from './components/ProjectCard'
import { WorksCard } from './components/WorksCard'
import { WorksPanel } from './components/WorksPanel'
import { LINK_ITEMS } from './data/links'
import type { WorkCard } from './data/works'
import { WORKS_PROJECTS, type WorksTabId } from './data/worksProjects'

type AppProps = {
  cards: WorkCard[]
}

type HubView = 'projects' | 'works' | 'links'

const SIDE_NAV_ITEMS: {
  id: HubView
  label: string
  icon: () => ReactElement
}[] = [
  { id: 'projects', label: 'Projects', icon: GridIcon },
  { id: 'works', label: 'Works', icon: BriefcaseIcon },
  { id: 'links', label: 'Links', icon: LinkIcon },
]

/** 지원 및 안내 패널 문구 */
const SUPPORT_INTRO =
  '풀스택으로 챗봇·RAG·배포를 하나씩 쌓아가고 있습니다. 이 허브는 진행 중인 작업물을 한곳에 모아둔 입구입니다.'
const SUPPORT_ROADMAP = [
  '1차: 순수 애플리케이션으로 기본 기능을 구현했습니다.',
  '2차: LangChain으로 문서 로드 → 청킹 → 벡터화 파이프라인을 적용했습니다.',
  '3차: LangGraph로 LLM과 Tool을 결합해 Agentic 검색을 개발 중입니다.',
]
const SUPPORT_GPU =
  '현재 챗봇 및 RAG 프로젝트를 고도화 중입니다. 연구 및 실험을 위해 GPU 자원을 공유해주실 분을 구합니다. 관련하여 도움을 주실 수 있다면 메일로 편하게 연락 부탁드립니다.'
const SUPPORT_EMAIL = 'regline@naver.com'

/**
 * 레이아웃: 얇은 왼쪽 바 | 컨텐츠
 * Projects / Works / Links 뷰 전환 + 지원 및 안내 드로어
 */
export function App({ cards }: AppProps) {
  const [activeView, setActiveView] = useState<HubView>('projects')
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  // Works 상세(README.md / CHANGELOG.md) — 사이드 Works 재클릭 시 목록으로 리셋
  const [worksDetail, setWorksDetail] = useState<{
    projectId: string
    tab: WorksTabId
  } | null>(null)

  useEffect(() => {
    if (!isSupportOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSupportOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSupportOpen])

  const handleNavClick = (view: HubView) => {
    setActiveView(view)
    if (view === 'works') {
      setWorksDetail(null)
    }
  }

  return (
    <div className="shell">
      <aside className="shell__aside">
        <nav aria-label="사이드 메뉴" className="shell__side-nav">
          <ul className="shell__side-list">
            {SIDE_NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      isActive
                        ? `shell__side-link shell__side-link--active shell__side-link--${item.id}`
                        : 'shell__side-link'
                    }
                    title={item.label}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <item.icon />
                    <span className="shell__side-label">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="shell__side-link shell__side-link--settings"
            title="지원 및 안내"
            aria-label="지원 및 안내 열기"
            aria-expanded={isSupportOpen}
            onClick={() => setIsSupportOpen((open) => !open)}
          >
            <SettingsIcon />
          </button>
        </nav>
      </aside>

      <div className="shell__content">
        <main
          className={
            activeView === 'works'
              ? 'shell__main shell__main--works'
              : 'shell__main'
          }
        >
          {activeView === 'projects' && <ProjectsView cards={cards} />}
          {activeView === 'works' && (
            <WorksView detail={worksDetail} setDetail={setWorksDetail} />
          )}
          {activeView === 'links' && <LinksView />}
        </main>

        {isSupportOpen && (
          <div className="support-overlay" role="presentation">
            <button
              type="button"
              className="support-overlay__dim"
              aria-label="배경 닫기"
              onClick={() => setIsSupportOpen(false)}
            />
            <aside
              className="support-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-panel-title"
            >
              <header className="support-panel__header">
                <h2 id="support-panel-title" className="support-panel__title">
                  지원 및 안내
                </h2>
                <button
                  type="button"
                  className="support-panel__close"
                  aria-label="닫기"
                  onClick={() => setIsSupportOpen(false)}
                >
                  ×
                </button>
              </header>

              <div className="support-panel__body">
                <section className="support-panel__section">
                  <h3 className="support-panel__section-title">소개</h3>
                  <p className="support-panel__text">{SUPPORT_INTRO}</p>
                  <ul className="support-panel__list">
                    {SUPPORT_ROADMAP.map((line) => (
                      <li key={line} className="support-panel__text">
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="support-panel__section">
                  <h3 className="support-panel__section-title">협업 · 나눔</h3>
                  <p className="support-panel__text">{SUPPORT_GPU}</p>
                </section>

                <section className="support-panel__section">
                  <h3 className="support-panel__section-title">연락</h3>
                  <p className="support-panel__text">
                    메일:{' '}
                    <a className="support-panel__mail" href={`mailto:${SUPPORT_EMAIL}`}>
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                </section>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectsView({ cards }: { cards: WorkCard[] }) {
  return (
    <>
      <div className="shell__main-head">
        <h1 className="shell__main-title">Projects</h1>
        <p className="shell__main-desc">
          작업물을 카드로 모아 둔 허브입니다. 카드의 링크로 각 앱을 엽니다.
        </p>
      </div>

      <section className="shell__grid" aria-label="프로젝트 목록">
        {cards
          .filter((card) => (card.section ?? 'projects') === 'projects')
          .map((card) => (
            <ProjectCard key={card.id} card={card} />
          ))}
      </section>

      <div className="shell__main-head shell__main-head--sub">
        <h2 className="shell__section-title">Docs</h2>
      </div>

      <section className="shell__grid shell__grid--docs" aria-label="문서 목록">
        {cards
          .filter((card) => card.section === 'docs')
          .map((card) => (
            <ProjectCard key={card.id} card={card} />
          ))}
      </section>

      <div className="shell__main-head shell__main-head--sub">
        <h2 className="shell__section-title">Profile</h2>
      </div>

      <section className="shell__grid shell__grid--profile" aria-label="프로필 목록">
        {cards
          .filter((card) => card.section === 'profile')
          .map((card) => (
            <ProjectCard key={card.id} card={card} />
          ))}
      </section>
    </>
  )
}

function WorksView({
  detail,
  setDetail,
}: {
  detail: { projectId: string; tab: WorksTabId } | null
  setDetail: (value: { projectId: string; tab: WorksTabId } | null) => void
}) {
  return (
    <>
      <div className="shell__main-head">
        <h1 className="shell__main-title">Works</h1>
        <p className="shell__main-desc">
          진행 중이거나 배포와 별개로 기록하는 작업물입니다. 완성되면 Projects로 옮길 수 있습니다.
        </p>
      </div>

      <div className="works-split">
        <section className="works-split__cards" aria-label="진행 중 작업 목록">
          {WORKS_PROJECTS.map((project) => (
            <WorksCard
              key={project.id}
              project={project}
              activeTab={detail && detail.projectId === project.id ? detail.tab : null}
              onSelectTab={(projectId, tab) => setDetail({ projectId, tab })}
            />
          ))}
        </section>

        <aside className="works-split__panel" aria-label="Works 상세 패널">
          {detail ? (
            <WorksPanel projectId={detail.projectId} tab={detail.tab} />
          ) : (
            <p className="works-split__empty">
              카드에서 <strong>README.md</strong> 또는 <strong>CHANGELOG.md</strong>를 선택하세요.
            </p>
          )}
        </aside>
      </div>
    </>
  )
}

function LinksView() {
  return (
    <>
      <div className="shell__main-head">
        <h1 className="shell__main-title">Links</h1>
        <p className="shell__main-desc">자주 쓰는 바로가기입니다.</p>
      </div>
      <LinksPanel items={LINK_ITEMS} />
    </>
  )
}

function GridIcon() {
  return (
    <svg className="shell__side-nav-icon shell__side-nav-icon--grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.4" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="shell__side-nav-icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3" y="7.5" width="18" height="12" rx="1.8" strokeLinejoin="round" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" strokeLinejoin="round" />
      <path d="M3 12.5h18" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="shell__side-nav-icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 0 0-5.66-5.66l-1.4 1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-2.83 2.83a4 4 0 0 0 5.66 5.66l1.4-1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      className="shell__side-settings-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.31.06-.63.06-.97 0-.34-.02-.66-.06-.97l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.31-.06.65-.06.97 0 .34.02.66.06.97l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z" />
    </svg>
  )
}
