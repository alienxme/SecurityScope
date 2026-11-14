import type { FilterCheck } from "./types"
import { fetchWithTimeout } from "./types"

// FortiGuard category IDs that the reference filter lets through.
const UNBLOCKED_CATEGORIES = new Set([
  0, 9, 28, 29, 30, 31, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44, 46, 47, 49, 50, 51, 52, 53, 63, 75, 76, 77, 78, 79, 80,
  81, 82, 84, 92,
])

export const fortiguard: FilterCheck = async (host) => {
  const response = await fetchWithTimeout("https://www.fortiguard.com/learnmore/dns", {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      Authority: "www.fortiguard.com",
      "Content-Type": "application/json;charset=UTF-8",
      Cookie: "cookiesession1=678A3E0F33B3CB9D7BEECD2B8A5DD036; privacy_agreement=true",
      Origin: "https://www.fortiguard.com",
      Referer: "https://www.fortiguard.com/services/sdns",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({ value: host, version: 9 }),
  })

  const result = await response.json()

  if (!result?.dns) {
    return { status: "Unknown", category: "Unknown" }
  }

  const { rating, categoryname } = result.dns
  const ratingNumber = Number.parseInt(rating, 10)

  return {
    status: UNBLOCKED_CATEGORIES.has(ratingNumber) ? "Unblocked" : "Blocked",
    category: categoryname || "Unknown",
  }
}
