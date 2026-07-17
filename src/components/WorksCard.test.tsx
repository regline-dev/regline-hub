import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorksCard } from './WorksCard'
import type { WorksProject } from '../data/worksProjects'

const tabbedProject: WorksProject = {
  id: 'chatbot-rag',
  title: '챗봇/RAG 프로젝트',
  summary: 'LangChain 인제스트 + LangGraph Tool 검색',
  badges: ['WIP'],
  tabs: ['status', 'ops'],
  changelogFile: 'chatbot-rag_CHANGELOG.md',
}

const opsOnlyProject: WorksProject = {
  id: 'works-placeholder-01',
  title: 'CHANGELOG',
  summary: 'regline-hub 포털 변경 이력',
  badges: ['Live'],
  tabs: ['ops'],
  changelogFile: 'regline-hub_CHANGELOG.md',
}

const plainProject: WorksProject = {
  id: 'works-placeholder-02',
  title: '다른 프로젝트 02',
  summary: '준비 중',
  badges: ['Soon'],
  tabs: [],
}

describe('WorksCard', () => {
  it('탭이 있는 카드에 진행현황·운영로그 버튼을 보여준다', () => {
    render(<WorksCard project={tabbedProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('button', { name: '진행현황' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '운영로그' })).toBeInTheDocument()
  })

  it('ops 탭만 있는 카드는 운영로그 버튼만 보여준다', () => {
    render(<WorksCard project={opsOnlyProject} onSelectTab={() => {}} />)
    expect(screen.queryByRole('button', { name: '진행현황' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '운영로그' })).toBeInTheDocument()
  })

  it('탭이 없는 카드는 준비 중 footer만 보여준다', () => {
    render(<WorksCard project={plainProject} onSelectTab={() => {}} />)
    expect(screen.queryByRole('button', { name: '진행현황' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '운영로그' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '준비 중' })).toBeDisabled()
  })
})
