import { Check, Columns2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCompare } from './compareContext'
import { compareUrl, EMPTY_SELECTION } from './selection'
export function CompareButton({ slug, className = '' }: { slug: string; className?: string }) {
  const compare = useCompare()
  if (!compare) return <Link to={compareUrl({ ...EMPTY_SELECTION, a: slug })} className={`compare-button ${className}`}>Compare</Link>
  const selected = compare.selection.a === slug || compare.selection.b === slug
  return <button type="button" className={`compare-button ${className}`} aria-pressed={selected} aria-label={`${selected ? 'Selected' : 'Compare'} ${slug.replaceAll('-', ' ')}`} onClick={() => selected ? compare.update(compare.selection.a === slug ? { a: null } : { b: null }) : compare.add(slug)}>{selected ? <Check size={15} /> : <Columns2 size={15} />}{selected ? 'Selected' : 'Compare'}<span className="sr-only"> {slug.replaceAll('-', ' ')}</span></button>
}
