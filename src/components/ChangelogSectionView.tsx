import type { ReactNode } from 'react'
import type { ChangelogSection } from '../data/parseChangelog'

type ChangelogSectionViewProps = {
  sections: ChangelogSection[]
}

/** CHANGELOG 날짜 섹션을 운영로그 화면에 그대로 표시 */
export function ChangelogSectionView({ sections }: ChangelogSectionViewProps) {
  return (
    <div className="changelog-view">
      {sections.map((section) => (
        <article key={section.id} className="changelog-view__section">
          <h2 className="changelog-view__date">{section.dateLabel}</h2>
          <div className="changelog-view__body">
            {renderSectionLines(section.lines)}
          </div>
        </article>
      ))}
    </div>
  )
}

function renderSectionLines(lines: string[]) {
  const nodes: ReactNode[] = []
  let bulletBuffer: string[] = []

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="changelog-view__list">
        {bulletBuffer.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>,
    )
    bulletBuffer = []
  }

  for (const line of lines) {
    if (line.startsWith('- ')) {
      bulletBuffer.push(line.slice(2))
      continue
    }
    flushBullets()

    const labeled = line.match(/^\*\*(.+?)\*\*\s*:\s*(.*)$/)
    if (labeled) {
      nodes.push(
        <p key={`p-${nodes.length}`} className="changelog-view__line">
          <strong>{labeled[1]}</strong>: {labeled[2]}
        </p>,
      )
      continue
    }

    nodes.push(
      <p key={`p-${nodes.length}`} className="changelog-view__line">
        {line}
      </p>,
    )
  }

  flushBullets()
  return nodes
}
