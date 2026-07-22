/** 포트폴리오 카드 한 장의 스키마 — 링크만 담는다 (앱 본체는 외부) */
export type WorkCard = {
  id: string
  /** 헤더에 보이는 프로젝트명 */
  title: string
  /** 한 줄 소개 */
  summary: string
  /** 헤더 하단 필 배지들 (예: Owner, Live) */
  badges: string[]
  /** 푸터 CTA 라벨 (예: OPEN APP) */
  actionLabel: string
  /** 절대 URL 또는 resolveHubUrls로 채울 상대 포트를 가진 템플릿 */
  href: string
  /** 카드가 속한 섹션 — 미지정 시 'projects' */
  section?: 'projects' | 'docs' | 'profile' | 'works'
  /** true면 흐린 개발 중 배경을 유지한다. hubTarget이 있으면 내부 이동은 동작한다. */
  disabled?: boolean
  /** hub 내부 Works 패널로 이동 (외부 URL 대신) */
  hubTarget?: { projectId: string; tab: 'status' | 'ops' }
}

/** 빌드 시 호스트 없이도 동작하는 정적 카드 정의 */
export const WORK_CARDS: WorkCard[] = [
  {
    id: 'faq-chatbot',
    title: 'chatbot-ui',
    summary: 'FAQ → Chroma → LLM 검색 쳇봇 UI',
    badges: ['Owner', 'Live'],
    actionLabel: 'OPEN APP',
    href: 'http://167.233.211.67:3001',
  },
  {
    id: 'chatbot-admin',
    title: 'chatbot-admin',
    summary: '품질관리 및 실시간 모니터링',
    badges: ['Owner', 'Live'],
    actionLabel: 'OPEN APP',
    href: 'http://167.233.211.67:3002',
  },
  {
    id: 'agentic-rag',
    title: 'LangGraph-Agentic RAG',
    summary: '로드 청킹 벡터화 << 질문→LLM판단→규칙라우터→Agent',
    badges: ['Owner', 'Live'],
    actionLabel: 'CHANGELOG.md',
    href: '#',
    // Projects → Works → LangGraph-Agentic → CHANGELOG.md
    hubTarget: { projectId: 'langgraph-agentic-backend', tab: 'ops' },
  },
  {
    id: 'lotto-insight',
    title: 'lotto-insight',
    summary: '심심풀이, 패턴으로 보는 로또',
    badges: ['Owner', 'Live'],
    actionLabel: 'OPEN APP',
    href: 'https://lotto-insight-pied.vercel.app',
  },
  {
    id: 'chatbot-manual',
    title: 'chatbot-개발가이드',
    summary: '쳇봇 개발 계획서',
    badges: ['Guide'],
    actionLabel: 'VIEW MANUAL',
    href: '/chatbot_guide.html',
    section: 'docs',
  },
  {
    id: 'budget-guide',
    title: '예산회계 가이드',
    summary: '예산회계 시스템 가이드 문서',
    badges: ['Guide'],
    actionLabel: 'VIEW MANUAL',
    href: '/budget_guide.html',
    section: 'docs',
  },
  {
    id: 'self-introduction',
    title: '자기소개서',
    summary: '경력 자기소개서 (PDF)',
    badges: ['PDF'],
    actionLabel: 'VIEW PDF',
    href: '/docs/self-introduction.pdf',
    section: 'profile',
  },
  {
    id: 'resume',
    title: '이력서',
    summary: '이력서 (PDF)',
    badges: ['PDF'],
    actionLabel: 'VIEW PDF',
    href: '/docs/Resume_jhc.pdf',
    section: 'profile',
  },
]

/**
 * Hetzner 같은 곳을 접속 hostname 기준으로 카드 URL을 만든다.
 * `__HOST__:포트` → `http(s)://{hostname}:포트`
 */
export function resolveHubUrls(
  cards: WorkCard[],
  hostname: string,
  protocol: 'http:' | 'https:' = 'http:',
): WorkCard[] {
  if (!hostname || hostname.trim() === '') {
    throw new Error('hostname이 비어 있으면 허브 URL을 만들 수 없습니다.')
  }

  return cards.map((card) => {
    if (!card.href.startsWith('__HOST__:')) {
      return card
    }
    const port = card.href.replace('__HOST__:', '')
    if (!/^\d+$/.test(port)) {
      throw new Error(`잘못된 포트 템플릿: ${card.href}`)
    }
    return {
      ...card,
      href: `${protocol}//${hostname}:${port}`,
    }
  })
}

/** MVP에 최소 카드가 있는지 + 필수 필드 검사 */
export function assertWorkCardsReady(cards: WorkCard[]): void {
  if (cards.length < 3) {
    throw new Error('MVP는 카드가 최소 3개여야 합니다.')
  }
  for (const card of cards) {
    if (!card.id || !card.title || !card.href || !card.actionLabel) {
      throw new Error(`카드 필수 필드 누락: ${JSON.stringify(card)}`)
    }
    if (!Array.isArray(card.badges) || card.badges.length === 0) {
      throw new Error(`배지가 없는 카드: ${card.id}`)
    }
  }
}
