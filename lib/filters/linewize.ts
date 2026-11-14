import { blockedResult, fetchWithTimeout, type FilterCheck } from "./types"

const BLOCKED_CATEGORIES = new Set([
  "animeandmanga", "dynamicdns", "trackers", "celebrities", "entertainment", "humouranddistractions",
  "livestreaming", "media", "socialmediaandcommunication", "marijuana", "crypto", "gamestorespublishers",
  "videogames", "blocklist.proxies", "aitools", "blocklist.dating", "blocklist.piracy", "whatsmyipservices",
  "p2p", "unsafesearchengines", "porn", "extreme", "malware", "matureandexplicit", "gamingresources", "offensive",
])

const strip = (s?: string) => s?.replaceAll("sphirewall.application.", "").replaceAll("sphirewall.category.", "")

export const linewize: FilterCheck = async (host) => {
  const res = await fetchWithTimeout(
    "https://mvgateway.syd-1.linewize.net/get/verdict?deviceid=PHYS-SMIC-US-0000-3190&cev=3.3.0&identity=null&requested_website=" +
      encodeURIComponent(host),
  )
  const json = await res.json()

  const subCategory = strip(json.signatures?.subCategory) || "Not rated"
  const category = strip(json.signatures?.category)

  // Unrated is treated as allowed; anything under blocklist.* is always blocked.
  let blocked = (!!category && BLOCKED_CATEGORIES.has(category)) || BLOCKED_CATEGORIES.has(subCategory)
  if (subCategory === "Not rated") blocked = false
  if (subCategory.startsWith("blocklist.")) blocked = true

  return blockedResult(subCategory, blocked)
}
