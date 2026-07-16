import type { LinkItem } from '../data/links'

type LinksPanelProps = {
  items: LinkItem[]
}

/** Links 메뉴 — 카드가 아닌 아이콘+라벨+↗ 리스트 */
export function LinksPanel({ items }: LinksPanelProps) {
  return (
    <ul className="links-list" aria-label="바로가기 목록">
      {items.map((item) => (
        <li key={item.id}>
          <a
            className="links-list__row"
            href={item.href}
            target={item.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          >
            <span className="links-list__icon" aria-hidden="true">
              <LinkRowIcon icon={item.icon} />
            </span>
            <span className="links-list__label">{item.label}</span>
            <span className="links-list__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function LinkRowIcon({ icon }: { icon: LinkItem['icon'] }) {
  switch (icon) {
    case 'tistory':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h14v16H5z" strokeLinejoin="round" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
        </svg>
      )
    case 'github':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.58.69.48A10.33 10.33 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
        </svg>
      )
    case 'mail':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
        </svg>
      )
    case 'pdf':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 3h7l4 4v14H7z" strokeLinejoin="round" />
          <path d="M14 3v4h4M9 13h6M9 17h4" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}
