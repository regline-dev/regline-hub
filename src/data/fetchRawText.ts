/** GitHub Raw 등 공개 텍스트 파일 조회 */
export async function fetchRawText(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  // GitHub Raw는 CDN 캐시가 길어, push 후에도 브라우저가 예전 CHANGELOG/README를 재사용할 수 있다
  const response = await fetchImpl(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`파일 조회 실패: HTTP ${response.status}`)
  }
  return response.text()
}
