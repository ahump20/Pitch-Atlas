import { Maximize2 } from 'lucide-react'
import { useInspectorApi } from './inspectorContext'

/** "Inspect card": opens the enlarged specimen. Renders only where the inspector lives. */
export function InspectButton({ slug, className = '' }: { slug: string; className?: string }) {
  const api = useInspectorApi()
  if (!api) return null
  return (
    <button
      type="button"
      className={`specimen-action ${className}`}
      aria-haspopup="dialog"
      onClick={(event) => api.open(slug, event.currentTarget)}
    >
      <Maximize2 size={14} aria-hidden="true" />
      Inspect card<span className="sr-only"> {slug.replaceAll('-', ' ')}</span>
    </button>
  )
}
