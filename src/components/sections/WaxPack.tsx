import { Link } from 'react-router-dom'

/*
  A sealed wax pack — the tools section's form. The wrapper is cream stock with
  crimped zigzag seals top and bottom, the tool's line schematic printed as
  wrapper art in one collegiate jewel ink, and a perforated houndstooth-holo
  tear strip across the top. Pointing at the pack (hover or keyboard focus)
  tears the cream flap back along the perforation — CSS only, no state — and
  clicking is the real tear: the pack opens straight into its tool. No fake
  unwrap state; the navigation IS the opening.
*/

export type ToolKind = 'dial' | 'quadrant' | 'tunnel' | 'grips'

export interface WaxPackTool {
  label: string
  to: string
  blurb: string
  kind: ToolKind
  /** wrapper-art ink: one of the collegiate jewels */
  ink: string
}

/* the tool schematic, printed in the pack's ink on the cream wrapper */
function PackArt({ kind, ink }: { kind: ToolKind; ink: string }) {
  const common = { fill: 'none', stroke: ink, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <div className="relative h-20 w-full overflow-hidden rounded-sm border" style={{ borderColor: 'rgba(33,29,23,.25)' }} aria-hidden="true">
      <svg viewBox="0 0 160 64" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {kind === 'dial' && (
          <>
            <circle cx="48" cy="32" r="22" {...common} opacity={0.5} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
              const r = (a * Math.PI) / 180
              return <path key={a} d={`M${48 + Math.cos(r) * 19} ${32 + Math.sin(r) * 19} L${48 + Math.cos(r) * 22} ${32 + Math.sin(r) * 22}`} {...common} opacity={0.5} />
            })}
            <path d="M48 32 L62 18" {...common} strokeWidth={2.2} />
            <circle cx="48" cy="32" r="2.6" fill={ink} stroke="none" />
            <path d="M92 40 q22 -28 52 -10" {...common} />
            <circle cx="144" cy="30" r="3" fill={ink} stroke="none" />
          </>
        )}
        {kind === 'quadrant' && (
          <>
            <path d="M80 8 V56 M40 32 H120" {...common} strokeWidth={1} opacity={0.4} />
            <circle cx="80" cy="32" r="24" {...common} strokeWidth={1} opacity={0.35} />
            <path d="M80 32 q-20 -6 -30 -22" {...common} />
            <circle cx="50" cy="10" r="3.4" fill={ink} stroke="none" />
            <path d="M80 32 q20 8 34 -2" {...common} opacity={0.55} />
            <circle cx="114" cy="30" r="3.4" fill={ink} stroke="none" opacity={0.55} />
          </>
        )}
        {kind === 'tunnel' && (
          <>
            <path d="M14 32 q60 0 84 0" {...common} />
            <path d="M14 32 q60 0 84 18" {...common} opacity={0.55} />
            <path d="M98 32 q22 0 48 -14" {...common} />
            <path d="M98 50 q22 0 48 8" {...common} opacity={0.55} />
            <line x1="98" y1="16" x2="98" y2="58" {...common} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
            <circle cx="146" cy="18" r="3" fill={ink} stroke="none" />
            <circle cx="146" cy="58" r="3" fill={ink} stroke="none" opacity={0.55} />
          </>
        )}
        {kind === 'grips' && (
          <>
            <path d="M80 10 L58 40 M80 10 L102 40" {...common} opacity={0.6} />
            <circle cx="80" cy="10" r="3" fill={ink} stroke="none" />
            <circle cx="50" cy="46" r="13" {...common} />
            <path d="M44 41 q6 5 0 10 M56 41 q-6 5 0 10" {...common} strokeWidth={1.3} opacity={0.8} />
            <circle cx="110" cy="46" r="13" {...common} />
            <path d="M104 41 q6 5 0 10 M116 41 q-6 5 0 10" {...common} strokeWidth={1.3} opacity={0.8} />
          </>
        )}
      </svg>
    </div>
  )
}

export function WaxPack({ tool }: { tool: WaxPackTool }) {
  return (
    <Link to={tool.to} className="wax-pack group" aria-label={`Open ${tool.label}`}>
      <span className="wax-tearstrip" aria-hidden="true">
        <span className="wax-tearflap">· tear here ·</span>
      </span>
      <PackArt kind={tool.kind} ink={tool.ink} />
      <span className="rfx-athletic block" style={{ fontSize: 'clamp(17px,2.4vw,22px)', lineHeight: 0.95, color: tool.ink }}>
        {tool.label}
      </span>
      <span className="block text-[12.5px] leading-snug" style={{ color: 'rgba(33,29,23,.78)' }}>
        {tool.blurb}
      </span>
      <span
        className="mt-auto block font-mono text-[9px] font-bold uppercase tracking-[0.16em]"
        style={{ color: 'rgba(33,29,23,.55)' }}
      >
        Open the pack →
      </span>
    </Link>
  )
}
