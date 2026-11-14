import sensoCats from "./data/senso.json"
import { blockedResult, fetchWithTimeout, type FilterCheck } from "./types"

const CATS = sensoCats as unknown as Record<string, [string, boolean]>

export const senso: FilterCheck = async (host) => {
  const res = await fetchWithTimeout("https://filtering.senso.cloud/filter/lookup?url=https://" + encodeURIComponent(host))
  const ids: Array<string | number> = await res.json()

  const known = ids.filter((id) => CATS[id]).map((id) => CATS[id])

  // No recognised categories → treated as blocked, matching the reference implementation.
  if (known.length === 0) return blockedResult("Uncategorized", true)

  return blockedResult(
    known.map(([name]) => name).join(", "),
    known.some(([, blocked]) => blocked),
  )
}
