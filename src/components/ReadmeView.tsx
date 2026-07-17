type ReadmeViewProps = {
  markdown: string
}

/** README Markdown을 가벼운 줄 단위로 표시 (풀 MD 엔진 없이) */
export function ReadmeView({ markdown }: ReadmeViewProps) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')

  return (
    <div className="readme-view">
      {lines.map((line, index) => {
        const key = `L${index}`
        if (line.startsWith('### ')) {
          return (
            <h3 key={key} className="readme-view__h3">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={key} className="readme-view__h2">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={key} className="readme-view__h1">
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={key} className="readme-view__quote">
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={key} className="readme-view__li">
              {stripInline(line.slice(2))}
            </li>
          )
        }
        if (line.trim() === '' || line.trim() === '---') {
          return <div key={key} className="readme-view__gap" />
        }
        if (line.startsWith('|')) {
          return (
            <p key={key} className="readme-view__table-row">
              {line}
            </p>
          )
        }
        return (
          <p key={key} className="readme-view__p">
            {stripInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function stripInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1')
}
