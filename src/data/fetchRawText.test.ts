import { describe, expect, it, vi } from 'vitest'
import { fetchRawText } from './fetchRawText'

describe('fetchRawText', () => {
  it('성공 시 본문 문자열을 반환한다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '# Hello\n',
    })
    await expect(fetchRawText('https://example.test/README.md', fetchImpl)).resolves.toBe(
      '# Hello\n',
    )
  })

  it('HTTP 실패 시 에러를 던진다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    await expect(fetchRawText('https://example.test/x', fetchImpl)).rejects.toThrow(/HTTP 404/)
  })
})
