/**
 * Works 메뉴 전용 프로젝트 (부록: 카드 그리드 + 선택적 탭)
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
  /** 운영로그 탭이 읽을 CHANGELOG 레포 파일명 (ops 탭 필수) */
  changelogFile?: string
}

export const WORKS_PROJECTS: WorksProject[] = [
  {
    id: 'chatbot-rag',
    title: '챗봇/RAG 프로젝트',
    summary: 'LangChain 인제스트 + LangGraph Agentic 검색',
    badges: ['WIP'],
    tabs: ['status', 'ops'],
    changelogFile: 'chatbot-rag_CHANGELOG.md',
  },
  {
    id: 'regline-hub-portal',
    title: 'regline-hub (포트폴리오 포털)',
    summary: '이 포털 자체의 계획·배포·운영 변경 기록',
    badges: ['Live'],
    tabs: ['ops'],
    changelogFile: 'regline-hub_CHANGELOG.md',
  },
  {
    id: 'works-placeholder-02',
    title: '다른 프로젝트 02',
    summary: '준비 중 — 대상 확정 후 채웁니다.',
    badges: ['Soon'],
    tabs: [],
  },
]

/** 진행현황 탭 — 수동 스냅샷 (부록 §3) */
export const WORKS_STATUS = {
  title: 'Agentic RAG (LangGraph)',
  badge: 'WIP',
  current: [
    '인제스트(로드→청킹→벡터화) 구현 완료',
    '검색 에이전트(도구 판단·재검색 루프) 개발 중',
  ],
  next: ['create_react_agent 방식 실험', 'frontend_react ChatHeader 연결'],
  docs: [
    { label: 'RAG_Agent_다이어그램_부록.md', href: '#' },
    { label: 'GitHub (regline-dev)', href: 'https://github.com/regline-dev' },
  ],
}

/** 운영로그 탭 — GitHub 조회 실패 시 폴백 stub */
export const WORKS_OPS_LOG: { date: string; text: string }[] = [
  { date: '20260716', text: 'Groq API 전환 (LLM_PROVIDER 라우팅)' },
  { date: '20260714', text: 'Dockerfile 시크릿 노출 이슈 수정' },
  { date: '20260713', text: 'Hetzner 본인인증 대기 중 배포 지연' },
  { date: '20260710', text: 'MariaDB 백업 스크립트 정리' },
]

export function assertWorksProjectsReady(projects: WorksProject[]): void {
  if (projects.length < 1) {
    throw new Error('Works 프로젝트가 비어 있습니다.')
  }
  for (const p of projects) {
    if (!p.id || !p.title || !Array.isArray(p.badges) || !Array.isArray(p.tabs)) {
      throw new Error(`Works 프로젝트 필드 누락: ${JSON.stringify(p)}`)
    }
    if (p.tabs.includes('ops') && !p.changelogFile) {
      throw new Error(`ops 탭에는 changelogFile이 필요합니다: ${p.id}`)
    }
  }
}
