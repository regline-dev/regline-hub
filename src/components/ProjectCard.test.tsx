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
})
