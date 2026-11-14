import blocksiJson from "./data/blocksi.json"
import { blockedResult, fetchWithTimeout, type FilterCheck } from "./types"

type WebEntry = { name: string; cat: string; num: number; blocked: boolean }
type AiEntry = { name: string; blocked: boolean }

const WEB = blocksiJson.web as unknown as Record<string, WebEntry>
const AI = Object.values(blocksiJson.ai as unknown as Record<string, AiEntry>)

export const blocksiAI: FilterCheck = async (host) => {
  const res = await fetchWithTimeout("https://api.blocksi.net/url-classifier-llm/predict_url", {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      authorization: "Basic QXp6YXo6QmxvY2tzaUthcmlt",
      cookie: "messagesUtk=7c549d6aa50b45909d79e1cf7a1ad085",
      "content-type": "application/json",
    },
    body: JSON.stringify({ url: host }),
  })
  const json = await res.json()

  const category: string = "document" in json ? json.document.predicted_specific_category : json.predicted_specific_category

  // Blocked unless the predicted category is explicitly marked allowed.
  const allowed = AI.some((entry) => entry.name === category && entry.blocked === false)
  return blockedResult(category === "Specific Category" ? "Unknown" : category, !allowed)
}

export const blocksiStandard: FilterCheck = async (host) => {
  const res = await fetchWithTimeout("https://service1.blocksi.net/getRating.json?url=" + encodeURIComponent(host))
  const json = await res.json()

  const category = WEB[String(json.Category)]
  if (!category) return blockedResult("Unknown", true)

  return blockedResult(`${category.cat}: ${category.name}`, category.blocked)
}
