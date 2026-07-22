import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProjectCard } from '../components/ProjectCard'
import type { WorkCard } from '../data/works'

const sampleCard: WorkCard = {
  id: 'faq-chatbot',
  title: 'faq-chatbot',
  summary: 'FAQ 챗봇',
  badges: ['Live', 'Hetzner'],
  actionLabel: 'OPEN APP',
  href: 'http://example.com:3001',
}

const agenticCard: WorkCard = {
  id: 'agentic-rag',
  title: 'LangGraph-Agentic RAG',
  summary: '로드 청킹 벡터화 << 질문→LLM판단→규칙라우터→Agent',
  badges: ['Owner', 'Live'],
  actionLabel: 'CHANGELOG.md',
  href: '#',
  hubTarget: { projectId: 'langgraph-agentic-backend', tab: 'ops' },
}

describe('ProjectCard (Hetzner 프로젝트 카드 레이아웃)', () => {
  it('카드 전체가 하나의 링크이며 제목·배지·CTA를 포함한다', () => {
    render(<ProjectCard card={sampleCard} />)

    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Hetzner')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /OPEN APP/i })
    expect(link).toHaveAttribute('href', 'http://example.com:3001')
    expect(link).toHaveAttribute('target', '_blank')
    // 카드 전체가 링크이므로 제목도 그 안에 포함돼야 한다
    expect(link).toContainElement(screen.getByRole('heading', { name: 'faq-chatbot' }))
  })

  it('Agentic 카드는 PDF 안내·검색 예시와 Works CHANGELOG로 이동한다', () => {
    const onHubNavigate = vi.fn()
    render(<ProjectCard card={agenticCard} onHubNavigate={onHubNavigate} />)

    const button = screen.getByRole('button', { name: /CHANGELOG\.md/i })
    expect(button).not.toHaveClass('project-card--disabled')
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Chat with us')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('① 상단 헤더에서 PDF 선택')).toBeInTheDocument()
    expect(screen.getByText('② 질문→LLM판단→라우팅')).toBeInTheDocument()
    expect(screen.getByText('· 이솝우화, ARKK 보고서')).toBeInTheDocument()
    expect(screen.getByText(/늑대와 어린양 한마디 결론은/)).toBeInTheDocument()
    expect(screen.getByText(/전체 목록/)).toBeInTheDocument()
    expect(
      screen.getByText('로드 청킹 벡터화 << 질문→LLM판단→규칙라우터→Agent'),
    ).toBeInTheDocument()

    button.click()
    expect(onHubNavigate).toHaveBeenCalledWith({
      projectId: 'langgraph-agentic-backend',
      tab: 'ops',
    })
  })
})
