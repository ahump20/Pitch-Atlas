import { useState, type FormEvent } from 'react'
import { submitExternalSuggestion } from '../../lib/external-content'

export function MediaSuggestionForm({ pitchSlug }: { pitchSlug?: string }) {
  const [url, setUrl] = useState('')
  const [rationale, setRationale] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      await submitExternalSuggestion({ url, rationale, pitchSlug })
      setUrl('')
      setRationale('')
      setStatus('Filed for review. Nothing publishes until it is checked and tagged.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not file that suggestion just now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="mt-6 rounded-[14px] border border-bone/12 bg-black/20 px-4 py-3">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2 transition-colors hover:text-cyan">
        Know a pitching post that belongs here?
      </summary>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-bone-2">Public post URL</span>
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://x.com/… or Instagram, TikTok, YouTube"
            className="mt-1.5 w-full rounded-md border border-bone/15 bg-black/35 px-3 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-bone-2/45 focus:border-cyan/60"
          />
        </label>
        <label className="md:col-span-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-bone-2">Why it belongs</span>
          <textarea
            required
            minLength={10}
            maxLength={300}
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            placeholder="What grip, story, lesson, or piece of pitching heritage does it preserve?"
            className="mt-1.5 min-h-24 w-full resize-y rounded-md border border-bone/15 bg-black/35 px-3 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-bone-2/45 focus:border-cyan/60"
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-sm border border-cyan/45 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan transition-colors hover:border-cyan hover:text-bone disabled:cursor-wait disabled:opacity-50"
          >
            {busy ? 'Filing…' : 'Send to review'}
          </button>
          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-bone-2/60">
            Public URLs only · no uploads · reviewed before publication
          </p>
        </div>
        {status ? <p role="status" className="md:col-span-2 text-sm text-cyan">{status}</p> : null}
        {error ? <p role="alert" className="md:col-span-2 text-sm text-seam">{error}</p> : null}
      </form>
    </details>
  )
}
