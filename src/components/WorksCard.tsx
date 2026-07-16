import type { WorksProject, WorksTabId } from '../data/worksProjects'

type WorksCardProps = {
  project: WorksProject
  onSelectTab: (projectId: string, tab: WorksTabId) => void
  onOpenPlain?: (projectId: string) => void
}

/** Works 그리드 카드 — 탭 있으면 진행현황/운영로그, 없으면 요약만 */
export function WorksCard({ project, onSelectTab, onOpenPlain }: WorksCardProps) {
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

      {project.hasTabs ? (
        <div className="works-card__tabs" role="group" aria-label={`${project.title} 탭`}>
          <button
            type="button"
            className="works-card__tab"
            onClick={() => onSelectTab(project.id, 'status')}
          >
            진행현황
          </button>
          <button
            type="button"
            className="works-card__tab"
            onClick={() => onSelectTab(project.id, 'ops')}
          >
            운영로그
          </button>
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
