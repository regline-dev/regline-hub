/** Links 메뉴 — 설명 없는 바로가기 한 줄 */
export type LinkItem = {
  id: string
  label: string
  href: string
  /** 아이콘 구분용 */
  icon: 'tistory' | 'github' | 'mail' | 'pdf'
}

/** GitHub: org 프로필 (pinned는 GitHub 설정으로 관리) */
export const LINK_ITEMS: LinkItem[] = [
  {
    id: 'tistory',
    label: '티스토리',
    href: 'https://regline.tistory.com',
    icon: 'tistory',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/regline-dev',
    icon: 'github',
  },
  {
    id: 'mail',
    label: '메일',
    href: 'mailto:regline@naver.com',
    icon: 'mail',
  },
  {
    id: 'resume-pdf',
    label: '자기소개서 PDF',
    href: '/docs/self-introduction.pdf',
    icon: 'pdf',
  },
]

export function assertLinkItemsReady(items: LinkItem[]): void {
  if (items.length < 4) {
    throw new Error('Links는 최소 4개여야 합니다.')
  }
  for (const item of items) {
    if (!item.id || !item.label || !item.href || !item.icon) {
      throw new Error(`링크 필수 필드 누락: ${JSON.stringify(item)}`)
    }
  }
}
