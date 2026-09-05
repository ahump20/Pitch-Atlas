/** Shared static leather finish. Seam geometry is supplied by each drawing. */
export function BaseballCover({ id, cx, cy, r }: { id: string; cx: number; cy: number; r: number }) {
  return <>
    <defs>
      <radialGradient id={`${id}-hide`} cx="31%" cy="23%" r="85%">
        <stop offset="0" stopColor="#FCFBF5" />
        <stop offset=".36" stopColor="#F0EFE8" />
        <stop offset=".65" stopColor="#D9D8D1" />
        <stop offset=".85" stopColor="#9B9C96" />
        <stop offset="1" stopColor="#575B59" />
      </radialGradient>
      <radialGradient id={`${id}-shadow`}>
        <stop stopColor="#000" stopOpacity=".7" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${id}-grain`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="scale(.5)">
        <path d="M1 2h.5 M5 1h.3 M3 6h.6 M8 4h.4 M7 8h.5" stroke="#666C64" strokeWidth=".35" strokeLinecap="round" opacity=".16" />
        <path d="M1 2.5h.5 M5 1.5h.3 M3 6.5h.6 M8 4.5h.4 M7 8.5h.5" stroke="#FFF" strokeWidth=".45" strokeLinecap="round" opacity=".24" />
      </pattern>
    </defs>
    <ellipse cx={cx + r * .08} cy={cy + r * 1.1} rx={r * .94} ry={r * .16} fill={`url(#${id}-shadow)`} />
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-hide)`} />
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-grain)`} />
    <circle cx={cx} cy={cy} r={r - .3} fill="none" stroke="#F9F8F0" strokeWidth=".6" strokeOpacity=".3" />
  </>
}
