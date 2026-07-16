import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { WORK_CARDS, resolveHubUrls } from './data/works'
import './styles.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('#root 요소를 찾을 수 없습니다.')
}

const protocol =
  window.location.protocol === 'https:' ? 'https:' : 'http:'
const cards = resolveHubUrls(WORK_CARDS, window.location.hostname, protocol)

createRoot(rootElement).render(
  <StrictMode>
    <App cards={cards} />
  </StrictMode>,
)
