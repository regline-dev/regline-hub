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
  })
})

describe('WORKS_PROJECTS 스키마', () => {
  it('카드별 탭·README·CHANGELOG 매핑을 가진다', () => {
    expect(() => assertWorksProjectsReady(WORKS_PROJECTS)).not.toThrow()
    expect(WORKS_PROJECTS.map((p) => p.title)).toEqual([
      '챗봇/RAG 프로젝트',
      'regline-hub',
      '다른 프로젝트 02',
    ])
    expect(WORKS_PROJECTS[0].changelogFile).toBe('chatbot-rag_CHANGELOG.md')
    expect(WORKS_PROJECTS[0].readmeRawUrl).toContain('chatbot-rag_README.md')
    expect(WORKS_PROJECTS[1].id).toBe('regline-hub')
    expect(WORKS_PROJECTS[1].changelogFile).toBe('regline-hub_CHANGELOG.md')
    expect(WORKS_PROJECTS[1].readmeRawUrl).toContain('regline-hub/main/README.md')
    expect(WORKS_PROJECTS[1].tabs).toEqual(['status', 'ops'])
  })

  it('status 탭에 readmeRawUrl이 없으면 에러', () => {
    expect(() =>
      assertWorksProjectsReady([
        {
          id: 'x',
          title: 'x',
          summary: 's',
          badges: [],
          tabs: ['status'],
        },
      ]),
    ).toThrow(/readmeRawUrl/)
  })
})

describe('resolveHubUrls', () => {
  it('__HOST__ 템플릿을 접속 hostname 포트로 바꾼다', () => {
    const resolved = resolveHubUrls(WORK_CARDS, '167.233.211.67')
    expect(resolved[0].href).toBe('http://167.233.211.67:3001')
  })
})
