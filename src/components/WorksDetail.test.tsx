import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { WorksDetail } from './WorksDetail'

const sampleMarkdown = `## 2026-07-17 (v2)

**변경 파일**: Docs/foo.md

**변경 내용**: CHANGELOG → Works 연동

- 화면: Works → 운영로그
`

describe('WorksDetail CHANGELOG', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => sampleMarkdown,
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('운영로그 화면에 CHANGELOG 섹션 본문을 표시한다', async () => {
    render(<WorksDetail projectId="chatbot-rag" tab="ops" onBack={() => {}} />)

    expect(screen.getByRole('heading', { level: 1, name: 'CHANGELOG' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('불러오는 중')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: '2026-07-17 (v2)' })).toBeInTheDocument()
    })
    expect(screen.getByText(/변경 파일/)).toBeInTheDocument()
    expect(screen.getByText(/Docs\/foo\.md/)).toBeInTheDocument()
    expect(screen.getByText(/CHANGELOG → Works 연동/)).toBeInTheDocument()
    expect(screen.getByText(/화면: Works/)).toBeInTheDocument()
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('chatbot-rag_CHANGELOG.md'),
    )
  })

  it('CHANGELOG 카드는 regline-hub_CHANGELOG.md를 조회한다', async () => {
    render(<WorksDetail projectId="works-placeholder-01" tab="ops" onBack={() => {}} />)

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('regline-hub_CHANGELOG.md'),
      )
    })
  })

  it('조회 실패 시 안내만 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    render(<WorksDetail projectId="chatbot-rag" tab="ops" onBack={() => {}} />)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('불러오지 못했습니다')
    })
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
