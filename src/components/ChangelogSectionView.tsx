import type { ReactNode } from 'react'
import type { ChangelogSection } from '../data/parseChangelog'

type ChangelogSectionViewProps = {
  sections: ChangelogSection[]
}

/** CHANGELOG 날짜 섹션을 타임라인형(세로선+dot)으로 표시, 변경 파일은 접기(최신만 펼침) */
export function ChangelogSectionView({ sections }: ChangelogSectionViewProps) {
  return (
    <div className="ops-log-timeline">
      {sections.map((section, index) => {
        const { datePart, versionPart } = splitDateLabel(section.dateLabel)
        return (
          <div key={section.id} className="ops-log-item">
            <span
              className={index === 0 ? 'ops-log-dot ops-log-dot--latest' : 'ops-log-dot'}
              aria-hidden="true"
            />
            <div className="ops-log-item__content">
              <h2 className="changelog-view__date">
                <span className="ops-log-date">{datePart}</span>
                {versionPart && <span className="ops-log-version"> {versionPart}</span>}
              </h2>
              <div className="changelog-view__body">
                {renderSectionLines(section.lines, index === 0)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** "YYYY-MM-DD (vN)" → 날짜/버전 분리 (폰트 굵기를 다르게 주기 위함) */
function splitDateLabel(dateLabel: string): { datePart: string; versionPart: string } {
  const match = dateLabel.match(/^(\S+)\s*(\(v\d+\))?$/)
  if (!match) return { datePart: dateLabel, versionPart: '' }
  return { datePart: match[1], versionPart: match[2] ?? '' }
}

/**
 * 라인을 분류해 고정 순서로 렌더링한다: 변경 내용(항상 노출) → 변경 파일(접기) → 나머지 불릿/라인.
 * 원본 마크다운의 줄 순서(변경 파일이 변경 내용보다 먼저)와 무관하게 이 순서로 고정한다.
 */
function renderSectionLines(lines: string[], isFirst: boolean) {
  let filesValue: string | null = null
  let summaryValue: string | null = null
  const bulletLines: string[] = []
  const otherLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('- ')) {
      bulletLines.push(line.slice(2))
      continue
    }

    const labeled = line.match(/^\*\*(.+?)\*\*\s*:\s*(.*)$/)
    if (labeled) {
      const [, label, value] = labeled
      if (label === '변경 파일') {
        filesValue = value
        continue
      }
      if (label === '변경 내용') {
        summaryValue = value
        continue
      }
      otherLines.push(`**${label}**: ${value}`)
      continue
    }

    otherLines.push(line)
  }

  const nodes: ReactNode[] = []

  // 요약은 첫 문장(첫 콤마 앞)까지만 details 밖에 항상 노출
  if (summaryValue) {
    const firstSentence = summaryValue.split(',')[0].trim()
    nodes.push(
      <p key="summary" className="changelog-view__line changelog-view__line--summary">
        {firstSentence}
      </p>,
    )
  }

  // 파일 pill + 불릿 목록을 details 안에 함께 접어둠 (파일 → 불릿 순)
  if (filesValue || bulletLines.length > 0) {
    const files = filesValue
      ? filesValue
          .split(',')
          .map((file) => file.trim())
          .filter(Boolean)
      : []
    nodes.push(
      <details key="details" className="ops-log-files" open={isFirst}>
        <summary className="ops-log-files__summary">변경 파일 보기</summary>
        {files.length > 0 && (
          <div className="ops-log-files__list">
            {files.map((file) => (
              <span key={file} className="ops-log-file-pill">
                {file}
              </span>
            ))}
          </div>
        )}
        {bulletLines.length > 0 && (
          <ul className="changelog-view__list">
            {bulletLines.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </details>,
    )
  }

  otherLines.forEach((line, i) => {
    nodes.push(
      <p key={`other-${i}`} className="changelog-view__line">
        {line}
      </p>,
    )
  })

  return nodes
}
