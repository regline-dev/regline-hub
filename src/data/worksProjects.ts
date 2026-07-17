/**
 * Works 메뉴 전용 프로젝트 (카드 그리드 + 선택적 탭)
 * Projects의 WorkCard(앱 링크)와 역할이 달라 분리한다.
 */
export type WorksTabId = 'status' | 'ops'

export type WorksProject = {
  id: string
  title: string
  summary: string
  badges: string[]
  /** 표시할 탭 — 비어 있으면 '준비 중' 카드 */
  tabs: WorksTabId[]
  /** CHANGELOG.md — 프로젝트 레포 Raw URL */
  changelogRawUrl?: string
  /** README.md — 프로젝트 레포 Raw URL */
  readmeRawUrl?: string
}

export const WORKS_PROJECTS: WorksProject[] = [
  {
    id: 'langgraph-agentic-backend',
    title: 'LangGraph-Agentic',
    summary: 'PDF 모드용 LangGraph Agentic 검색 백엔드',
    badges: ['WIP'],
    tabs: ['status', 'ops'],
    changelogRawUrl:
      'https://raw.githubusercontent.com/regline-dev/LangGraph-Agentic-backend/main/CHANGELOG.md',
    readmeRawUrl:
      'https://raw.githubusercontent.com/regline-dev/LangGraph-Agentic-backend/main/README.md',
  },
  {
    id: 'regline-hub',
    title: 'regline-hub',
    summary: '포트폴리오 포털 — 카드로 작업물을 둘러보는 입구',
    badges: ['Live'],
    tabs: ['status', 'ops'],
    changelogRawUrl:
      'https://raw.githubusercontent.com/regline-dev/regline-hub/main/CHANGELOG.md',
    readmeRawUrl:
      'https://raw.githubusercontent.com/regline-dev/regline-hub/main/README.md',
  },
  {
    id: 'works-placeholder-02',
    title: '다른 프로젝트 02',
    summary: '준비 중 — 대상 확정 후 채웁니다.',
    badges: ['Soon'],
    tabs: [],
  },
  {
    id: 'works-placeholder-03',
    title: '다른 프로젝트 03',
    summary: '준비 중 — 대상 확정 후 채웁니다.',
    badges: ['Soon'],
    tabs: [],
  },
]

export function assertWorksProjectsReady(projects: WorksProject[]): void {
  if (projects.length < 1) {
    throw new Error('Works 프로젝트가 비어 있습니다.')
  }
  for (const p of projects) {
    if (!p.id || !p.title || !Array.isArray(p.badges) || !Array.isArray(p.tabs)) {
      throw new Error(`Works 프로젝트 필드 누락: ${JSON.stringify(p)}`)
    }
    if (p.tabs.includes('ops') && !p.changelogRawUrl) {
      throw new Error(`ops 탭에는 changelogRawUrl이 필요합니다: ${p.id}`)
    }
    if (p.tabs.includes('status') && !p.readmeRawUrl) {
      throw new Error(`status 탭에는 readmeRawUrl이 필요합니다: ${p.id}`)
    }
  }
}
