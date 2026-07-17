import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('운영로그 탭에 CHANGELOG 섹션을 표시한다', async () => {
    render(<WorksPanel projectId="regline-hub" tab="ops" onClear={() => {}} />)

    expect(screen.getByRole('heading', { level: 2, name: '운영로그' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '2026-07-17 (v2)' })).toBeInTheDocument()
    })
    expect(screen.getByText(/스플릿 패널/)).toBeInTheDocument()
  })

  it('진행현황 탭에 README를 표시한다', async () => {
    render(<WorksPanel projectId="regline-hub" tab="status" onClear={() => {}} />)

    expect(screen.getByRole('heading', { level: 2, name: '진행현황' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'README' })).toBeInTheDocument()
    })
    expect(screen.getByText(/포트폴리오 포털/)).toBeInTheDocument()
  })

  it('선택 해제 버튼을 누를 수 있다', async () => {
    const onClear = vi.fn()
    const user = userEvent.setup()
    render(<WorksPanel projectId="regline-hub" tab="ops" onClear={onClear} />)
    await user.click(screen.getByRole('button', { name: '선택 해제' }))
    expect(onClear).toHaveBeenCalled()
  })
})
