import { fetchRawText } from './fetchRawText'

/** CHANGELOG.md 섹션 → Works 한 줄 요약 (폴백·레거시) */
export type ChangelogOpsEntry = {
  date: string
  text: string
}

/** CHANGELOG.md 날짜 섹션 본문 */
export type ChangelogSection = {
  id: string
  dateLabel: string
  lines: string[]
}

/**
 * `## YYYY-MM-DD (vN)` + `**변경 내용**:` 한 줄만 추출한다.
 * 폴백 stub 목록용.
 */
export function parseChangelogMarkdown(markdown: string): ChangelogOpsEntry[] {
  const entries: ChangelogOpsEntry[] = []
  const sections = markdown.split(/^## /m).slice(1)

  for (const section of sections) {
    const headingMatch = section.match(/^(\d{4})-(\d{2})-(\d{2})\s*\(v(\d+)\)/)
    if (!headingMatch) continue

    const date = `${headingMatch[1]}${headingMatch[2]}${headingMatch[3]}`
    const summaryMatch = section.match(/\*\*변경 내용\*\*\s*:\s*(.+)/)
    if (!summaryMatch) continue

    const text = summaryMatch[1].trim()
    if (!text) continue

    entries.push({ date, text })
  }

  return entries
}

/** `## 날짜 (vN)` 섹션별 본문 줄 — CHANGELOG.md 탭에 그대로 표시 */
export function parseChangelogSections(markdown: string): ChangelogSection[] {
  const sections: ChangelogSection[] = []
  const parts = markdown.split(/^## /m).slice(1)

  for (const part of parts) {
    const headingMatch = part.match(/^(\d{4}-\d{2}-\d{2})\s*\(v(\d+)\)/)
    if (!headingMatch) continue

    const dateLabel = `${headingMatch[1]} (v${headingMatch[2]})`
    const body = part.slice(headingMatch[0].length)
    const lines = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line !== '---')

    if (lines.length === 0) continue

    sections.push({
      id: `${headingMatch[1]}-v${headingMatch[2]}`,
      dateLabel,
      lines,
    })
  }

  return sections
}

export async function fetchChangelogMarkdown(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  return fetchRawText(url, fetchImpl)
}

export async function fetchChangelogSections(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ChangelogSection[]> {
  const markdown = await fetchChangelogMarkdown(url, fetchImpl)
  return parseChangelogSections(markdown)
}

/** @deprecated 폴백용 — fetchChangelogSections 사용 권장 */
export async function fetchChangelogOps(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ChangelogOpsEntry[]> {
  const markdown = await fetchChangelogMarkdown(url, fetchImpl)
  return parseChangelogMarkdown(markdown)
}
