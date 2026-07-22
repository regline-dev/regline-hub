import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { VisitStatsBadge } from './VisitStatsBadge'

describe('VisitStatsBadge', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('방문 기록 후 우측 상단 형식으로 Visitors/Views를 보여준다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ visitors: 1, pageViews: 4 }),
      }),
    )

    render(<VisitStatsBadge />)

    await waitFor(() => {
      expect(screen.getByLabelText('방문 통계')).toHaveTextContent('Visitors 1')
      expect(screen.getByLabelText('방문 통계')).toHaveTextContent('Views 4')
    })
  })

  it('API 실패 시 배지를 숨긴다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    )

    const { container } = render(<VisitStatsBadge />)

    await waitFor(() => {
      expect(container.querySelector('[aria-label="방문 통계"]')).toBeNull()
    })
  })
})
