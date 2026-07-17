import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { WorksPanel } from './WorksPanel'

describe('WorksPanel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (String(url).includes('CHANGELOG.md') || String(url).includes('_CHANGELOG')) {
          return {
            ok: true,
            text: async () =>
              `## 2026-07-17 (v2)\n\n**변경 내용**: 스플릿 패널\n\n- 테스트\n`,
          }
        }
        return {
          ok: true,
          text: async () => `# README\n\n포트폴리오 포털입니다.\n`,
        }
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('CHANGELOG.md 탭에 CHANGELOG 섹션을 표시한다', async () => {
    render(<WorksPanel projectId="regline-hub" tab="ops" />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'regline-hub CHANGELOG.md' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '2026-07-17 (v2)' })).toBeInTheDocument()
    })
    expect(screen.getByText(/스플릿 패널/)).toBeInTheDocument()
  })

  it('README.md 탭에 README를 표시한다', async () => {
    render(<WorksPanel projectId="regline-hub" tab="status" />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'regline-hub README.md' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/포트폴리오 포털/)).toBeInTheDocument()
    })
    // README 맨 위 H1("# README")은 패널 헤더와 중복되므로 렌더링되지 않아야 함
    expect(screen.queryByRole('heading', { name: 'README' })).not.toBeInTheDocument()
  })
})
