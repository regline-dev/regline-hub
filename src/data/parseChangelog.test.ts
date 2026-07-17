import { describe, expect, it } from 'vitest'
import { parseChangelogMarkdown } from './parseChangelog'

const sample = `# regline-hub CHANGELOG

---

## 2026-07-17 (v2)

**변경 파일**: Docs/foo.md

**변경 내용**: CHANGELOG → Works 연동 계획 확정

- 상세 줄은 무시

---

## 2026-07-16 (v1)

**변경 파일**: src/App.tsx

**변경 내용**: Works/Links 메뉴 분리

- 이유: MVP
`

describe('parseChangelogMarkdown', () => {
  it('날짜 섹션과 변경 내용 한 줄을 운영로그 항목으로 파싱한다', () => {
    const entries = parseChangelogMarkdown(sample)
    expect(entries).toEqual([
      { date: '20260717', text: 'CHANGELOG → Works 연동 계획 확정' },
      { date: '20260716', text: 'Works/Links 메뉴 분리' },
    ])
  })

  it('섹션이 없으면 빈 배열을 반환한다', () => {
    expect(parseChangelogMarkdown('# title only\n')).toEqual([])
  })
})
