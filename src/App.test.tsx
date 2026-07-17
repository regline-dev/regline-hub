import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { App } from './App'
import { WORK_CARDS, resolveHubUrls } from './data/works'

function renderHub() {
  const cards = resolveHubUrls(WORK_CARDS, 'example.com')
  return render(<App cards={cards} />)
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `## 2026-07-17 (v1)\n\n**변경 내용**: 테스트\n`,
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App 셸 레이아웃', () => {
  it('얇은 왼쪽바 + 컨텐츠만 있고 상단·푸터는 없다', () => {
    renderHub()
    expect(screen.getByRole('navigation', { name: '사이드 메뉴' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })
})

describe('사이드 네비 · Works · Links', () => {
  it('Works는 카드와 상세 패널을 동시에 보여준다', async () => {
    const user = userEvent.setup()
    renderHub()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Works' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '진행 중 작업 목록' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Works 상세 패널' })).toBeInTheDocument()
    expect(
      screen.getByText((_, el) => el?.classList.contains('works-split__empty') === true),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'LangGraph-Agentic' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'regline-hub' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '다른 프로젝트 02' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '다른 프로젝트 03' })).toBeInTheDocument()
  })

  it('CHANGELOG.md 클릭 시 카드는 유지되고 오른쪽에 CHANGELOG가 뜬다', async () => {
    const user = userEvent.setup()
    renderHub()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    const hubCard = screen.getByRole('heading', { name: 'regline-hub' }).closest('article')
    expect(hubCard).toBeTruthy()
    await user.click(within(hubCard as HTMLElement).getByRole('button', { name: 'CHANGELOG.md' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Works' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'regline-hub' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'regline-hub CHANGELOG.md' }),
    ).toBeInTheDocument()
  })

  it('Works 사이드 재클릭 시 패널 선택이 해제된다', async () => {
    const user = userEvent.setup()
    renderHub()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    const hubCard = screen.getByRole('heading', { name: 'regline-hub' }).closest('article')
    await user.click(within(hubCard as HTMLElement).getByRole('button', { name: 'CHANGELOG.md' }))
    expect(
      screen.getByRole('heading', { level: 2, name: 'regline-hub CHANGELOG.md' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    expect(
      screen.queryByRole('heading', { level: 2, name: 'regline-hub CHANGELOG.md' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText((_, el) => el?.classList.contains('works-split__empty') === true),
    ).toBeInTheDocument()
  })

  it('Links로 전환된다', async () => {
    const user = userEvent.setup()
    renderHub()
    await user.click(screen.getByRole('button', { name: 'Links' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Links' })).toBeInTheDocument()
  })
})
