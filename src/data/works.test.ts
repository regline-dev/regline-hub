import { describe, expect, it } from 'vitest'
import {
  WORK_CARDS,
  assertWorkCardsReady,
  resolveHubUrls,
} from '../data/works'
import { LINK_ITEMS, assertLinkItemsReady } from '../data/links'
import { WORKS_PROJECTS, assertWorksProjectsReady } from '../data/worksProjects'

describe('WORK_CARDS 스키마', () => {
  it('MVP 카드와 필수 필드·섹션을 가진다', () => {
    expect(() => assertWorkCardsReady(WORK_CARDS)).not.toThrow()
    expect(WORK_CARDS.map((card) => card.id)).toEqual([
      'faq-chatbot',
      'chatbot-admin',
      'agentic-rag',
      'lotto-insight',
      'chatbot-manual',
      'budget-guide',
      'self-introduction',
      'resume',
    ])
    expect(WORK_CARDS.filter((c) => c.section === 'docs').map((c) => c.id)).toEqual([
      'chatbot-manual',
      'budget-guide',
    ])
    expect(WORK_CARDS.filter((c) => c.section === 'profile').map((c) => c.id)).toEqual([
      'self-introduction',
      'resume',
    ])
  })

  it('새 카드 추가는 배열에 한 줄만 추가하면 된다', () => {
    const withExtra = [
      ...WORK_CARDS,
      {
        id: 'stt-demo',
        title: 'stt-demo',
        summary: '음성→텍스트',
        badges: ['Soon'],
        actionLabel: 'OPEN APP',
        href: '__HOST__:9091',
      },
    ]
    expect(withExtra).toHaveLength(WORK_CARDS.length + 1)
    expect(() => assertWorkCardsReady(withExtra)).not.toThrow()
  })
})

describe('LINK_ITEMS 스키마', () => {
  it('바로가기 4개와 필수 href를 가진다', () => {
    expect(() => assertLinkItemsReady(LINK_ITEMS)).not.toThrow()
    expect(LINK_ITEMS.map((item) => item.id)).toEqual([
      'tistory',
      'github',
      'mail',
      'resume-pdf',
    ])
    expect(LINK_ITEMS.find((i) => i.id === 'mail')?.href).toBe('mailto:regline@naver.com')
    expect(LINK_ITEMS.find((i) => i.id === 'resume-pdf')?.href).toBe(
      '/docs/self-introduction.pdf',
    )
  })
})

describe('WORKS_PROJECTS 스키마', () => {
  it('카드별 탭·CHANGELOG 파일 매핑을 가진다', () => {
    expect(() => assertWorksProjectsReady(WORKS_PROJECTS)).not.toThrow()
    expect(WORKS_PROJECTS.map((p) => p.title)).toEqual([
      '챗봇/RAG 프로젝트',
      'regline-hub (포트폴리오 포털)',
      '다른 프로젝트 02',
    ])
    expect(WORKS_PROJECTS[0].tabs).toEqual(['status', 'ops'])
    expect(WORKS_PROJECTS[0].changelogFile).toBe('chatbot-rag_CHANGELOG.md')
    expect(WORKS_PROJECTS[1].tabs).toEqual(['ops'])
    expect(WORKS_PROJECTS[1].changelogFile).toBe('regline-hub_CHANGELOG.md')
    expect(WORKS_PROJECTS[2].tabs).toEqual([])
  })

  it('ops 탭이 있는데 changelogFile이 없으면 에러', () => {
    expect(() =>
      assertWorksProjectsReady([
        { id: 'x', title: 'x', summary: 's', badges: [], tabs: ['ops'] },
      ]),
    ).toThrow(/changelogFile/)
  })
})

describe('resolveHubUrls', () => {
  it('__HOST__ 템플릿을 접속 hostname 포트로 바꾼다', () => {
    const resolved = resolveHubUrls(WORK_CARDS, '167.233.211.67')
    expect(resolved[0].href).toBe('http://167.233.211.67:3001')
    expect(resolved[1].href).toBe('http://167.233.211.67:3002')
    expect(resolved[3].href).toBe('https://lotto-insight-pied.vercel.app')
  })

  it('hostname이 비면 에러', () => {
    expect(() => resolveHubUrls(WORK_CARDS, '')).toThrow(/hostname/)
  })
})
