import lanschoolJson from "./data/lanschool.json"
import { blockedResult, fetchWithTimeout, type FilterCheck } from "./types"

const CATS = lanschoolJson as unknown as Record<string, string | null>

// LanSchool filtering runs on Netsweeper appliances. The default is a live UK
// tenant from the reference project; set LANSCHOOL_URL to target another one.
const LANSCHOOL_URL = process.env.LANSCHOOL_URL || "https://filter.wavenetcloud.netsweeper.com:3431"

// Netsweeper "001 <url> - - - - <requestid>" lookup, base64-encoded.
const buildLookup = (host: string) => Buffer.from(`001 https://${host} - - - - 3372822944`).toString("base64")

function parseCategories(text: string): string {
  const match = text.match(/[?&]cat=([^&\s]+)/)
  if (!match) return "Unknown"
  return match[1]
    .split(",")
    .map((id) => CATS[id] || id)
    .join(", ")
}

export const lanschool: FilterCheck = async (host) => {
  const res = await fetchWithTimeout(`${LANSCHOOL_URL}/${buildLookup(host)}`)
  const text = await res.text()

  if (text.startsWith("ALLOW")) return blockedResult("Allowed", false)
  return blockedResult(parseCategories(text), true)
}
