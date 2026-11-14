import { type NextRequest, NextResponse } from "next/server"
import { CHECKERS } from "@/lib/filters"
import { FILTERS, type DomainResult, type FilterKey, type FilterResult } from "@/lib/filters/meta"

// The Lightspeed lookup uses a WebSocket (`ws`) and several modules use Node
// APIs, so this route can't run on the edge runtime any more.
export const runtime = "nodejs"
export const maxDuration = 60

const MAX_URLS_PER_REQUEST = 25
const HOSTNAME_RE = /^(?=.{1,253}$)([a-z0-9_]([a-z0-9_-]{0,61}[a-z0-9_])?\.)+[a-z]{2,63}$/

const NOT_CHECKED: FilterResult = { status: "Not Checked", category: "Not Checked" }
const ERROR: FilterResult = { status: "Error", category: "Error" }

function cleanHost(input: unknown): string | null {
  if (typeof input !== "string") return null
  const host = input
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, "")
  return HOSTNAME_RE.test(host) ? host : null
}

async function runFilter(key: FilterKey, host: string): Promise<FilterResult> {
  try {
    return await CHECKERS[key](host)
  } catch (error) {
    console.error(`[${key}] ${host}:`, error instanceof Error ? error.message : error)
    return ERROR
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls, filters } = await request.json()

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Invalid input: 'urls' must be a non-empty array." }, { status: 400 })
    }
    if (urls.length > MAX_URLS_PER_REQUEST) {
      return NextResponse.json({ error: `Too many URLs (max ${MAX_URLS_PER_REQUEST} per request).` }, { status: 400 })
    }

    // Lightspeed + FortiGuard stay on by default when omitted; the rest are opt-in.
    const selected = FILTERS.filter((f) => (f.defaultOn ? filters?.[f.key] !== false : filters?.[f.key] === true)).map(
      (f) => f.key,
    )

    if (selected.length === 0) {
      return NextResponse.json({ error: "At least one filter must be selected." }, { status: 400 })
    }

    const domains: DomainResult[] = []

    for (const raw of urls) {
      const host = cleanHost(raw)

      const row = { url: host ?? String(raw) } as DomainResult
      for (const f of FILTERS) row[f.key] = NOT_CHECKED

      if (!host) {
        for (const key of selected) row[key] = ERROR
        domains.push(row)
        continue
      }

      // All selected filters run concurrently for a given domain.
      const results = await Promise.all(selected.map((key) => runFilter(key, host)))
      selected.forEach((key, i) => {
        row[key] = results[i]
      })

      domains.push(row)
    }

    return NextResponse.json({ domains })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
