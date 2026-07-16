import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { WORK_CARDS, resolveHubUrls } from './data/works'

function renderHub() {
  const cards = resolveHubUrls(WORK_CARDS, 'example.com')
  return render(<App cards={cards} />)
}

describe('App 셸 레이아웃', () => {
  it('얇은 왼쪽바 + 컨텐츠만 있고 상단·푸터는 없다', () => {
    renderHub()

    expect(screen.getByRole('navigation', { name: '사이드 메뉴' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Docs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '문서 목록' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '프로필 목록' })).toBeInTheDocument()
  })

  it('설정 버튼으로 지원 및 안내 패널을 열고 닫는다', async () => {
    const user = userEvent.setup()
    renderHub()

    const toggle = screen.getByRole('button', { name: '지원 및 안내 열기' })
    expect(screen.queryByRole('dialog', { name: '지원 및 안내' })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(screen.getByRole('dialog', { name: '지원 및 안내' })).toBeInTheDocument()
    expect(screen.getByText('regline@naver.com')).toBeInTheDocument()

    await user.click(toggle)
    expect(screen.queryByRole('dialog', { name: '지원 및 안내' })).not.toBeInTheDocument()

    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.queryByRole('dialog', { name: '지원 및 안내' })).not.toBeInTheDocument()
  })
})

describe('사이드 네비 · Works · Links', () => {
  it('초기 뷰는 Projects이고 Works/Links로 전환·복귀한다', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(screen.getByRole('button', { name: 'Works' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Works' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '진행 중 작업 목록' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Works' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('heading', { level: 1, name: 'Projects' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '챗봇/RAG 프로젝트' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '다른 프로젝트 01' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '다른 프로젝트 02' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '진행현황' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '운영로그' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Links' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Links' })).toBeInTheDocument()
    const links = screen.getByRole('list', { name: '바로가기 목록' })
    expect(within(links).getByRole('link', { name: /티스토리/ })).toHaveAttribute(
      'href',
      'https://regline.tistory.com',
    )
    expect(within(links).getByRole('link', { name: /GitHub/ })).toBeInTheDocument()
    expect(within(links).getByRole('link', { name: /메일/ })).toHaveAttribute(
      'href',
      'mailto:regline@naver.com',
    )
    expect(within(links).getByRole('link', { name: /자기소개서/ })).toHaveAttribute(
      'href',
      '/docs/self-introduction.pdf',
    )

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Docs' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: '바로가기 목록' })).not.toBeInTheDocument()
  })

  it('Projects 뷰에는 Works 카드가 없고 Works 뷰에만 있다', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.queryByRole('heading', { name: '챗봇/RAG 프로젝트' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Works' }))
    expect(screen.getByRole('heading', { name: '챗봇/RAG 프로젝트' })).toBeInTheDocument()
  })

  it('Works 진행현황 탭으로 상세에 들어가고 뒤로 나온다', async () => {
    const user = userEvent.setup()
    renderHub()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    await user.click(screen.getByRole('button', { name: '진행현황' }))
    expect(screen.getByRole('heading', { name: 'Agentic RAG (LangGraph)' })).toBeInTheDocument()
    expect(screen.getByText(/인제스트/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '← 뒤로' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Works' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '진행현황' })).toBeInTheDocument()
  })

  it('운영로그 상세에서 Works 사이드를 다시 누르면 카드 목록으로 돌아온다', async () => {
    const user = userEvent.setup()
    renderHub()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    await user.click(screen.getByRole('button', { name: '운영로그' }))
    expect(screen.getByRole('heading', { name: '배포·운영 로그' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Works' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Works' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '진행현황' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '배포·운영 로그' })).not.toBeInTheDocument()
  })
})
