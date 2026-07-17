import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { WorksDetail } from './WorksDetail'

describe('WorksDetail 운영로그', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          `## 2026-07-17 (v2)\n\n**변경 내용**: CHANGELOG → Works 연동\n`,
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GitHub CHANGELOG 항목을 운영로그에 표시한다', async () => {
    render(<WorksDetail tab="ops" onBack={() => {}} />)

    expect(screen.getByRole('status')).toHaveTextContent('불러오는 중')

    await waitFor(() => {
      expect(screen.getByText('CHANGELOG → Works 연동')).toBeInTheDocument()
    })
    expect(screen.getByText('20260717')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub CHANGELOG' })).toHaveAttribute(
      'href',
      'https://github.com/regline-dev/CHANGELOG',
    )
  })

  it('조회 실패 시 stub 폴백과 안내를 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    render(<WorksDetail tab="ops" onBack={() => {}} />)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('불러오지 못해')
    })
    expect(screen.getByText(/Groq API/)).toBeInTheDocument()
  })
})
