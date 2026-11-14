import ciscoBlocked from "./data/cisco-blocked.json"
import type { FilterCheck } from "./types"
import { fetchWithTimeout } from "./types"

const BLOCKED = new Set<string>(ciscoBlocked)

export const cisco: FilterCheck = async (host) => {
  const response = await fetchWithTimeout(
    `https://talosintelligence.com/cloud_intel/url_reputation?url=${encodeURIComponent(host)}`,
  )

  if (!response.ok) {
    return { status: "Unknown", category: "Unknown" }
  }

  const body = await response.json()
  const categories: string[] = (body?.reputation?.aup_cat || []).map((entry: { name: string }) => entry.name)

  // Unrated hosts are treated as blocked, matching the reference implementation.
  if (categories.length === 0) {
    return { status: "Blocked", category: "Not rated" }
  }

  return {
    status: categories.some((c) => BLOCKED.has(c)) ? "Blocked" : "Unblocked",
    category: categories.join(", "),
  }
}
