/** GitHub Raw 등 공개 텍스트 파일 조회 */
export async function fetchRawText(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl(url)
  if (!response.ok) {
    throw new Error(`파일 조회 실패: HTTP ${response.status}`)
  }
  return response.text()
}
