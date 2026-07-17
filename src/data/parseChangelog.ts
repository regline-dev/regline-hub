/** CHANGELOG.md 섹션 → Works 운영로그 항목 */
export type ChangelogOpsEntry = {
  date: string
  text: string
}

/**
 * `## YYYY-MM-DD (vN)` + `**변경 내용**:` 한 줄만 추출한다.
 * 상세 불릿은 MVP에서 무시.
 */
export function parseChangelogMarkdown(markdown: string): ChangelogOpsEntry[] {
  const entries: ChangelogOpsEntry[] = []
  // 섹션 헤딩으로 분할 (첫 fragment는 서문)
  const sections = markdown.split(/^## /m).slice(1)

  for (const section of sections) {
    const headingMatch = section.match(/^(\d{4})-(\d{2})-(\d{2})\s*\(v\d+\)/)
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

/** GitHub Raw — 인증 없이 공개 파일 조회 */
const CHANGELOG_RAW_BASE =
  'https://raw.githubusercontent.com/regline-dev/CHANGELOG/main/'

/** CHANGELOG 레포 안 파일명 → Raw URL */
export function changelogRawUrl(file: string): string {
  return `${CHANGELOG_RAW_BASE}${file}`
}

export async function fetchChangelogOps(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ChangelogOpsEntry[]> {
  const response = await fetchImpl(url)
  if (!response.ok) {
    throw new Error(`CHANGELOG 조회 실패: HTTP ${response.status}`)
  }
  const markdown = await response.text()
  return parseChangelogMarkdown(markdown)
}
