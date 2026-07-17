import type { WorksProject, WorksTabId } from '../data/worksProjects'

type WorksCardProps = {
  project: WorksProject
  /** 현재 오른쪽 패널에 표시 중인 탭 — 이 카드 것이 아니면 null */
  activeTab?: WorksTabId | null
  onSelectTab: (projectId: string, tab: WorksTabId) => void
  onOpenPlain?: (projectId: string) => void
}

/** Works 그리드 카드 — 탭 있으면 README.md / CHANGELOG.md, 없으면 요약만 */
export function WorksCard({ project, activeTab, onSelectTab, onOpenPlain }: WorksCardProps) {
  return (
    <article className="works-card">
      <div className="works-card__header">
        <div className="works-card__top">
          <h2 className="works-card__title">{project.title}</h2>
          <ul className="works-card__badges">
            {project.badges.map((badge) => (
              <li key={badge} className="works-card__badge">
                {badge}
              </li>
            ))}
          </ul>
        </div>
        <p className="works-card__summary">{project.summary}</p>
      </div>

      {project.tabs.length > 0 ? (
        <div className="works-card__tabs" role="group" aria-label={`${project.title} 탭`}>
          {project.tabs.includes('status') && (
            <button
              type="button"
              className={
                activeTab === 'status' ? 'works-card__tab works-card__tab--active' : 'works-card__tab'
              }
              onClick={() => onSelectTab(project.id, 'status')}
            >
              README.md
            </button>
          )}
          {project.tabs.includes('ops') && (
            <button
              type="button"
              className={
                activeTab === 'ops' ? 'works-card__tab works-card__tab--active' : 'works-card__tab'
              }
              onClick={() => onSelectTab(project.id, 'ops')}
            >
              CHANGELOG.md
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="works-card__footer"
          onClick={() => onOpenPlain?.(project.id)}
          disabled={!onOpenPlain}
        >
          {project.badges.includes('Soon') ? '준비 중' : '열기'}
        </button>
      )}
    </article>
  )
}
