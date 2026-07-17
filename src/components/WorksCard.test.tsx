import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorksCard } from './WorksCard'
import type { WorksProject } from '../data/worksProjects'

const tabbedProject: WorksProject = {
  id: 'chatbot-rag',
  title: '챗봇/RAG 프로젝트',
  summary: '요약',
  badges: ['WIP'],
  tabs: ['status', 'ops'],
  changelogFile: 'chatbot-rag_CHANGELOG.md',
  readmeRawUrl: 'https://example.test/README.md',
}

const hubProject: WorksProject = {
  id: 'regline-hub',
  title: 'regline-hub',
  summary: '포털',
  badges: ['Live'],
  tabs: ['status', 'ops'],
  changelogFile: 'regline-hub_CHANGELOG.md',
  readmeRawUrl: 'https://example.test/hub-README.md',
}

describe('WorksCard', () => {
  it('탭이 있는 카드에 진행현황·운영로그 버튼을 보여준다', () => {
    render(<WorksCard project={tabbedProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('button', { name: '진행현황' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '운영로그' })).toBeInTheDocument()
  })

  it('regline-hub 카드 제목을 표시한다', () => {
    render(<WorksCard project={hubProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('heading', { name: 'regline-hub' })).toBeInTheDocument()
  })
})
