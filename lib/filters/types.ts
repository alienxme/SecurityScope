import type { FilterResult } from "./meta"

/** Every filter module exports a function with this shape. */
export type FilterCheck = (host: string) => Promise<FilterResult>

export const errorResult: FilterResult = { status: "Error", category: "Error" }

/** Result for filters whose verdict is expressed as "blocked?" */
export function blockedResult(category: string, blocked: boolean): FilterResult {
  return { status: blocked ? "Blocked" : "Unblocked", category: category || "Unknown" }
}

/** Fetch with a hard timeout so one dead vendor endpoint can't hang the route. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" })
  } finally {
    clearTimeout(timer)
  }
}
