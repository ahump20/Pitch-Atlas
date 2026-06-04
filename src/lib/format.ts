/*
  Formatting helpers. The "as of" line on the page computes from a real
  retrievedAt date and nothing else. No freshness string is ever hardcoded.
*/

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Format an ISO date (YYYY-MM-DD) as "June 4, 2026". Parsed by parts to avoid
 * any timezone off-by-one. Returns the input unchanged if it is not a plain
 * ISO date, so a malformed value is never silently turned into a wrong date.
 */
export function asOfDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const year = Number(m[1])
  const monthIndex = Number(m[2]) - 1
  const day = Number(m[3])
  if (monthIndex < 0 || monthIndex > 11) return iso
  return `${MONTHS[monthIndex]} ${day}, ${year}`
}
