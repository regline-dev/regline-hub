import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorksCard } from './WorksCard'
import type { WorksProject } from '../data/worksProjects'

const tabbedProject: WorksProject = {
  id: 'langgraph-agentic-backend',
  title: 'LangGraph-Agentic',
  summary: '요약',
  badges: ['WIP'],
  tabs: ['status', 'ops'],
  changelogRawUrl: 'https://example.test/CHANGELOG.md',
  readmeRawUrl: 'https://example.test/README.md',
}

const hubProject: WorksProject = {
  id: 'regline-hub',
  title: 'regline-hub',
  summary: '포털',
  badges: ['Live'],
  tabs: ['status', 'ops'],
  changelogRawUrl: 'https://example.test/hub-CHANGELOG.md',
  readmeRawUrl: 'https://example.test/hub-README.md',
}

describe('WorksCard', () => {
  it('탭이 있는 카드에 README.md·CHANGELOG.md 버튼을 보여준다', () => {
    render(<WorksCard project={tabbedProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('button', { name: 'README.md' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CHANGELOG.md' })).toBeInTheDocument()
  })

  it('regline-hub 카드 제목을 표시한다', () => {
    render(<WorksCard project={hubProject} onSelectTab={() => {}} />)
    expect(screen.getByRole('heading', { name: 'regline-hub' })).toBeInTheDocument()
  })
})
