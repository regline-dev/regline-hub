import { describe, expect, it, vi } from 'vitest'
import { fetchChangelogOps } from './parseChangelog'

describe('fetchChangelogOps', () => {
  it('Raw 응답을 파싱해 항목 배열을 반환한다', async () => {
    const markdown = `## 2026-07-17 (v1)\n\n**변경 내용**: Vercel 배포\n`
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => markdown,
    })

    const entries = await fetchChangelogOps('https://example.test/changelog.md', fetchImpl)
    expect(entries).toEqual([{ date: '20260717', text: 'Vercel 배포' }])
    expect(fetchImpl).toHaveBeenCalledWith('https://example.test/changelog.md')
  })

  it('HTTP 실패 시 에러를 던진다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    await expect(fetchChangelogOps('https://example.test/x', fetchImpl)).rejects.toThrow(
      /HTTP 404/,
    )
  })
})
