import { useEffect, useState, type ReactNode } from 'react'
import type { WorkCard } from '../data/works'

type ProjectCardProps = {
  card: WorkCard
  /** hubTarget 카드 클릭 시 Works 등 내부 화면으로 이동 */
  onHubNavigate?: (target: NonNullable<WorkCard['hubTarget']>) => void
}

/**
 * 다크 헤더(프로젝트별 아이콘+제목+⋯+배지) / 흰 푸터(+ CTA)
 * 카드 사이즈는 균일 유지, 아이콘만 프로젝트 성격에 맞게 분기
 */
export function ProjectCard({ card, onHubNavigate }: ProjectCardProps) {
  const className = card.disabled ? 'project-card project-card--disabled' : 'project-card'
  const body = <ProjectCardBody card={card} />

  // Works 내부 이동 — 외부 GitHub 링크가 아님
  if (card.hubTarget) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onHubNavigate?.(card.hubTarget!)}
      >
        {body}
      </button>
    )
  }

  const hasLink = card.href !== '#'
  return (
    <a
      className={className}
      {...(hasLink ? { href: card.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  )
}

function ProjectCardBody({ card }: { card: WorkCard }): ReactNode {
  return (
    <>
      <div
        className={
          card.id === 'faq-chatbot' ||
          card.id === 'chatbot-admin' ||
          card.id === 'lotto-insight' ||
          card.id === 'agentic-rag'
            ? 'project-card__header project-card__header--thumbnail'
            : 'project-card__header'
        }
      >
        <div className="project-card__top">
          <div className="project-card__title-row">
            <span
              className={`project-card__icon project-card__icon--${iconTone(card.id)}`}
              aria-hidden="true"
            >
              <CardIcon id={card.id} />
            </span>
            <h2 className="project-card__title">{card.title}</h2>
          </div>
          <span
            className="project-card__menu"
            aria-hidden="true"
            onClick={(e) => e.stopPropagation()}
          >
            ···
          </span>
        </div>

        <ul className="project-card__badges">
          {card.badges.map((badge) => (
            <li
              key={badge}
              className={
                badge === 'Live' ? 'project-card__badge project-card__badge--live' : 'project-card__badge'
              }
            >
              {badge}
            </li>
          ))}
        </ul>

        {card.id === 'faq-chatbot' && <FaqChatbotThumbnail />}
        {card.id === 'chatbot-admin' && <ChatbotAdminThumbnail />}
        {card.id === 'lotto-insight' && <LottoInsightThumbnail />}
        {card.id === 'agentic-rag' && <AgenticRagThumbnail />}
        {card.section === 'docs' && <DocThumbnail />}
        {card.section === 'profile' && <ProfileThumbnail />}

        <p className="project-card__summary">{card.summary}</p>
      </div>

      <div className="project-card__footer">
        <span className="project-card__action">+ {card.actionLabel}</span>
      </div>
    </>
  )
}

/** agentic-rag 카드 전용 — chatbot-ui PDF 모드 정적 목업 */
function AgenticRagThumbnail() {
  return (
    <div className="agentic-thumbnail" aria-hidden="true">
      <div className="agentic-thumbnail__header">
        <span className="agentic-thumbnail__title">Chat with us</span>
        <span className="agentic-thumbnail__mode">PDF</span>
      </div>
      <div className="agentic-thumbnail__body">
        <ul className="agentic-thumbnail__sources">
          <li>이솝우화</li>
          <li>ARKK 주식보고서</li>
        </ul>
        <p className="agentic-thumbnail__chat">채팅 : 전체 목록 후 관련 검색하시면</p>
        <p className="agentic-thumbnail__flow">질문→LLM판단→규칙라우터→Agent</p>
      </div>
    </div>
  )
}

function DocPageIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M6 2.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z"
        strokeLinejoin="round"
      />
      <path d="M15 2.5V6a1 1 0 0 0 1 1h3" strokeLinejoin="round" />
      <path d="M8 12h8M8 15.5h8M8 18.5h5" strokeLinecap="round" />
    </svg>
  )
}

/** Docs 섹션 공통 — 가이드 문서류 전부 재사용하는 단순 목업 (내용 아닌 파일 성격 기반) */
function DocThumbnail() {
  return (
    <div className="doc-thumbnail" aria-hidden="true">
      <span className="doc-thumbnail__icon">
        <DocPageIcon />
      </span>
    </div>
  )
}

/** Profile 섹션 공통 — PDF/프로필류 전부 재사용하는 단순 목업 */
function ProfileThumbnail() {
  return (
    <div className="profile-thumbnail" aria-hidden="true">
      <span className="profile-thumbnail__icon">
        <DocPageIcon />
      </span>
      <span className="profile-thumbnail__badge">PDF</span>
    </div>
  )
}

type ThumbnailMessage = { sender: 'bot' | 'user'; text: string }

const THUMBNAIL_SCRIPT: ThumbnailMessage[] = [
  { sender: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
  { sender: 'user', text: '예산 메뉴 알려줘' },
  { sender: 'bot', text: '예산 편성, 배정 등 6개 메뉴가 있어요' },
]

const THUMBNAIL_TYPE_SPEED_MS = 35
const THUMBNAIL_BETWEEN_MESSAGE_DELAY_MS = 180
const THUMBNAIL_LOOP_RESET_DELAY_MS = 1800

/** faq-chatbot 카드 전용 — 타이핑 애니메이션이 무한 반복되는 미니 채팅 목업 */
function FaqChatbotThumbnail() {
  const [messages, setMessages] = useState<ThumbnailMessage[]>([])
  const [typing, setTyping] = useState<ThumbnailMessage | null>(null)

  useEffect(() => {
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
      timeouts.push(id)
    }

    function typeMessage(index: number) {
      if (cancelled) return
      const message = THUMBNAIL_SCRIPT[index]
      let charCount = 0

      const typeNextChar = () => {
        if (cancelled) return
        charCount += 1
        setTyping({ sender: message.sender, text: message.text.slice(0, charCount) })

        if (charCount < message.text.length) {
          schedule(typeNextChar, THUMBNAIL_TYPE_SPEED_MS)
          return
        }

        // 타이핑 완료 — 즉시 확정 메시지로 커밋
        setMessages((prev) => [...prev, message])
        setTyping(null)

        const isLast = index === THUMBNAIL_SCRIPT.length - 1
        if (isLast) {
          schedule(() => {
            setMessages([])
            typeMessage(0)
          }, THUMBNAIL_LOOP_RESET_DELAY_MS)
        } else {
          schedule(() => typeMessage(index + 1), THUMBNAIL_BETWEEN_MESSAGE_DELAY_MS)
        }
      }

      typeNextChar()
    }

    typeMessage(0)

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="faq-thumbnail" aria-hidden="true">
      <div className="faq-thumbnail__header">Chat with us</div>
      <div className="faq-thumbnail__thread">
        {messages.map((m, i) => (
          <span key={i} className={`faq-thumbnail__bubble faq-thumbnail__bubble--${m.sender}`}>
            {m.text}
          </span>
        ))}
        {typing && (
          <span className={`faq-thumbnail__bubble faq-thumbnail__bubble--${typing.sender}`}>
            {typing.text}
          </span>
        )}
      </div>
    </div>
  )
}

const ADMIN_STATS = [
  { label: '오늘 질문', value: '248' },
  { label: '평균 응답', value: '1.2s' },
  { label: '미응답', value: '3' },
]

const ADMIN_CHART_BARS = [35, 85, 30, 55, 65, 50]

/** chatbot-admin 카드 전용 — 정적 미니 대시보드 목업 (애니메이션 없음) */
function ChatbotAdminThumbnail() {
  return (
    <div className="admin-thumbnail" aria-hidden="true">
      <div className="admin-thumbnail__stats">
        {ADMIN_STATS.map((stat) => (
          <div key={stat.label} className="admin-thumbnail__stat">
            <span className="admin-thumbnail__stat-label">{stat.label}</span>
            <span className="admin-thumbnail__stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="admin-thumbnail__chart">
        {ADMIN_CHART_BARS.map((height, i) => (
          <span key={i} className="admin-thumbnail__bar" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  )
}

/** lotto-insight 카드 전용 — 실제 앱 스크린샷 이미지 */
function LottoInsightThumbnail() {
  return (
    <div className="lotto-thumbnail" aria-hidden="true">
      <img className="lotto-thumbnail__img" src="/img/lotto_01.jpg" alt="" />
    </div>
  )
}

/** 프로젝트 id별 아이콘 — 없는 id는 기본(폴더) 아이콘으로 폴백 */
function CardIcon({ id }: { id: string }) {
  switch (id) {
    case 'faq-chatbot':
      return <ChatIcon />
    case 'chatbot-admin':
      return <DashboardIcon />
    case 'lotto-insight':
      return <DiceIcon />
    case 'chatbot-manual':
      return <BookIcon />
    case 'budget-guide':
      return <BookIcon />
    case 'self-introduction':
      return <UserIcon />
    case 'resume':
      return <UserIcon />
    case 'agentic-rag':
      return <ChatIcon />
    default:
      return <FolderIcon />
  }
}

/** 프로젝트 id별 아이콘 칩 색상 톤 */
function iconTone(id: string): 'teal' | 'violet' | 'amber' | 'slate' | 'blue' | 'rose' {
  switch (id) {
    case 'faq-chatbot':
      return 'teal'
    case 'chatbot-admin':
      return 'violet'
    case 'lotto-insight':
      return 'amber'
    case 'chatbot-manual':
      return 'blue'
    case 'budget-guide':
      return 'amber'
    case 'self-introduction':
      return 'rose'
    case 'resume':
      return 'slate'
    case 'agentic-rag':
      return 'violet'
    default:
      return 'slate'
  }
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.2 3.5a.5.5 0 0 1-.8-.39V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="10.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="10.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.75" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.4" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.4" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.4" />
    </svg>
  )
}

function DiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" strokeLinejoin="round" />
      <circle cx="8.3" cy="8.3" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="8.3" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="8.3" cy="15.7" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="15.7" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 5a1.5 1.5 0 0 1 1.5-1.5H11v15H5.5A1.5 1.5 0 0 0 4 20z"
        strokeLinejoin="round"
      />
      <path
        d="M20 5a1.5 1.5 0 0 0-1.5-1.5H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.87 3.36-7 7.5-7s7.5 3.13 7.5 7" strokeLinecap="round" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M3.5 6.5a1 1 0 0 1 1-1H9l2 2h8.5a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"
        strokeLinejoin="round"
      />
    </svg>
  )
}
