import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { WorksCard } from './WorksCard'
import type { WorksProject } from '../data/worksProjects'

const tabbedProject: WorksProject = {
  id: 'chatbot-rag',
  title: '챗봇/RAG 프로젝트',
  summary: 'LangChain 인제스트 + LangGraph Tool 검색',
  badges: ['WIP'],
  hasTabs: true,
}

const plainProject: WorksProject = {
  id: 'works-placeholder-01',
  title: '다른 프로젝트 01',
  summary: '준비 중',
  badges: ['Soon'],
  hasTabs: false,
}

describe('WorksCard', () => {
  it('탭이 있는 카드에 진행현황·운영로그 버튼을 보여준다', () => {
    render(<WorksCard project={tabbedProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('heading', { name: '챗봇/RAG 프로젝트' })).toBeInTheDocument()
    expect(screen.getByText('WIP')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '진행현황' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '운영로그' })).toBeInTheDocument()
  })

  it('탭이 없는 카드는 요약만 보여준다', () => {
    render(<WorksCard project={plainProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('heading', { name: '다른 프로젝트 01' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '진행현황' })).not.toBeInTheDocument()
  })
})
