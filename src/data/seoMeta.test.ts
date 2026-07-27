/**
 * SEO — index.html에 description·og 최소 세트가 있는지 검증
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const indexHtml = readFileSync(join(rootDir, 'index.html'), 'utf8')

describe('regline-hub index.html SEO', () => {
  it('description·keywords·og 최소 세트를 포함한다', () => {
    expect(indexHtml).toContain('name="description"')
    expect(indexHtml).toContain('Regline 작업물 포털')
    expect(indexHtml).toContain('name="keywords"')
    expect(indexHtml).toContain('property="og:title"')
    expect(indexHtml).toContain('property="og:description"')
    expect(indexHtml).toContain('property="og:url"')
    expect(indexHtml).toContain('https://regline-hub-three.vercel.app/')
    expect(indexHtml).toContain('property="og:image"')
    expect(indexHtml).toContain('google-site-verification')
    expect(indexHtml).toContain('-tYwP4dvhr9sVW6lFFabmGriZfXCFcpkOqgUwQffTlU')
    expect(indexHtml).toContain('Regline Works')
  })
})
