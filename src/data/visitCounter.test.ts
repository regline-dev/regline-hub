import { describe, expect, it, vi } from 'vitest'
import {
  applyVisit,
  parseVisitStats,
  recordHubVisit,
  VISIT_SESSION_KEY,
} from './visitCounter'

describe('applyVisit', () => {
  it('새 방문자면 visitors와 pageViews를 모두 올린다', () => {
    expect(applyVisit({ visitors: 1, pageViews: 3 }, true)).toEqual({
      visitors: 2,
      pageViews: 4,
    })
  })

  it('재방문(같은 세션)이면 pageViews만 올린다', () => {
    expect(applyVisit({ visitors: 2, pageViews: 4 }, false)).toEqual({
      visitors: 2,
      pageViews: 5,
    })
  })
})

describe('parseVisitStats', () => {
  it('잘못된 값은 0으로 보정한다', () => {
    expect(parseVisitStats(null)).toEqual({ visitors: 0, pageViews: 0 })
    expect(parseVisitStats({ visitors: 'x', pageViews: 2 })).toEqual({
      visitors: 0,
      pageViews: 2,
    })
  })
})

describe('recordHubVisit', () => {
  it('새 세션이면 isNewVisitor true로 POST하고 세션 키를 저장한다', async () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    }
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ visitors: 1, pageViews: 1 }),
    })

    const stats = await recordHubVisit(fetchImpl, storage)

    expect(stats).toEqual({ visitors: 1, pageViews: 1 })
    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/visit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ isNewVisitor: true }),
      }),
    )
    expect(storage.setItem).toHaveBeenCalledWith(VISIT_SESSION_KEY, '1')
  })

  it('API 실패 시 null을 반환한다', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    const stats = await recordHubVisit(fetchImpl, {
      getItem: () => '1',
      setItem: () => undefined,
    })
    expect(stats).toBeNull()
  })
})
