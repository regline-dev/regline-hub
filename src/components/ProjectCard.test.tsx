import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
  summary: 'Agent가 질문을 판단해 이솝·ARKK 벡터DB중 컬렉션으로 연결',
  badges: ['Owner', 'Live'],
  actionLabel: 'OPEN APP',
  href: 'http://167.233.211.67:3002/pdf/generate',
}

const ocrCard: WorkCard = {
  id: 'ocr-tab',
  title: 'OCR - Agent',
  summary: '영수증·견적서 등 문서 OCR 인식 → 자동 작성',
  badges: ['Owner', 'Live'],
  actionLabel: 'OPEN APP',
  href: 'http://167.233.211.67:3001/?widget=true&channel=ocr',
}

describe('ProjectCard (Hetzner 프로젝트 카드 레이아웃)', () => {
  it('카드 전체가 하나의 링크이며 제목·배지·CTA를 포함한다', () => {
    render(<ProjectCard card={sampleCard} />)

    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Hetzner')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /OPEN APP/i })
    expect(link).toHaveAttribute('href', 'http://example.com:3001')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toContainElement(screen.getByRole('heading', { name: 'faq-chatbot' }))
  })

  it('Agentic 카드는 PDF 안내와 어드민 /pdf/generate 링크를 연다', () => {
    render(<ProjectCard card={agenticCard} />)

    const link = screen.getByRole('link', { name: /OPEN APP/i })
    expect(link).toHaveAttribute('href', 'http://167.233.211.67:3002/pdf/generate')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).not.toHaveClass('project-card--disabled')
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Chat with us')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('① 상단 헤더에서 PDF 선택')).toBeInTheDocument()
    expect(screen.getByText('② 질문→LLM판단→라우터→Agent')).toBeInTheDocument()
    expect(screen.getByText('· 이솝우화, ARKK 보고서 2개의 벡터DB')).toBeInTheDocument()
    expect(screen.getByText(/늑대와 어린양 한마디 결론은/)).toBeInTheDocument()
    expect(screen.getByText(/전체 목록/)).toBeInTheDocument()
    expect(
      screen.getByText('Agent가 질문을 판단해 이솝·ARKK 벡터DB중 컬렉션으로 연결'),
    ).toBeInTheDocument()
  })

  it('OCR 카드는 Chat with us + OCR 배지 안내를 보여 준다', () => {
    render(<ProjectCard card={ocrCard} />)

    expect(screen.getByRole('link', { name: /OPEN APP/i })).toHaveAttribute(
      'href',
      'http://167.233.211.67:3001/?widget=true&channel=ocr',
    )
    expect(screen.getByText('Chat with us')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'OCR - Agent' })).toBeInTheDocument()
    expect(screen.getByText('OCR')).toBeInTheDocument()
    expect(screen.getByText('① 상단 헤더에서 OCR 선택')).toBeInTheDocument()
    expect(screen.getByText('② 사진이나 채팅으로 품목→ 수량·단가 → 영수증')).toBeInTheDocument()
    expect(screen.getByText('· 미리보기 · 저장하기 · 다운로드')).toBeInTheDocument()
    expect(screen.getByText(/품목 2개 2000원/)).toBeInTheDocument()
    expect(screen.getByText(/사진 업로드 후 품목 확인/)).toBeInTheDocument()
    expect(screen.queryByText('PDF')).not.toBeInTheDocument()
  })
})
