import { useEffect, useState } from 'react'
import '../../styles/study.css'

export function ChapterSections({ sections, label = 'In this pitch' }: { sections: { id: string; label: string }[]; label?: string }) {
  const [active, setActive] = useState('')
  const ids = sections.map(section => section.id).join('|')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
        else visible.delete(entry.target.id)
      }
      const first = [...visible].sort((a, b) => a[1] - b[1])[0]
      if (first) setActive(first[0])
    }, { rootMargin: '-15% 0px -55% 0px' })
    ids.split('|').forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element) })
    return () => observer.disconnect()
  }, [ids])
  return <nav className="study-chapter-nav" aria-label={label}>
    {sections.map((section, index) => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => setActive(section.id)}><span className="chapter-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.label}</a>)}
  </nav>
}
