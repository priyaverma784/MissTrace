/**
 * The backend has no statistics endpoint (and we must not invent one), so the
 * "Searches Performed" and "Potential Matches" dashboard cards are counted in
 * this browser only, from the real searches made through this app.
 */
const KEY = 'misstrace.usage'

interface Usage {
  searches: number
  matches: number
}

export function readUsage(): Usage {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    if (typeof parsed === 'object' && parsed !== null) {
      const p = parsed as Partial<Usage>
      return {
        searches: typeof p.searches === 'number' ? p.searches : 0,
        matches: typeof p.matches === 'number' ? p.matches : 0,
      }
    }
  } catch {
    /* ignore */
  }
  return { searches: 0, matches: 0 }
}

export function recordSearch(matchCount: number): void {
  const current = readUsage()
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ searches: current.searches + 1, matches: current.matches + matchCount }),
    )
  } catch {
    /* ignore */
  }
}
