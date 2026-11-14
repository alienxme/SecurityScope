import WebSocket from "ws"
import lightspeedJson from "./data/lightspeed.json"
import type { FilterResult } from "./meta"
import type { FilterCheck } from "./types"

// Defaults come from the filter-checker project; override via env in deployment.
const LIGHTSPEED_WEBSOCKET_URL =
  process.env.LIGHTSPEED_WEBSOCKET_URL ||
  "wss://production-gc.lsfilter.com?a=0ef9b862-b74f-4e8d-8aad-be549c5f452a&customer_id=74-1082-F000&agentType=chrome_extension&agentVersion=3.777.0&userGuid=00000000-0000-0000-0000-000000000000"
const LIGHTSPEED_IP = process.env.LIGHTSPEED_IP || "174.85.104.135"
const LIGHTSPEED_CUSTOMER_ID = process.env.LIGHTSPEED_CUSTOMER_ID || "74-1082-F000"

const TIMEOUT_MS = 8000

function categorize(cat: unknown): FilterResult {
  const entry = lightspeedJson.find((e) => Number(e.CategoryNumber) === Number(cat))
  if (!entry) return { status: "Blocked", category: "Uncategorized" }
  return {
    status: String(entry.Allow) === "1" ? "Unblocked" : "Blocked",
    category: entry.CategoryName || "Unknown",
  }
}

export const lightspeed: FilterCheck = (host) =>
  new Promise<FilterResult>((resolve, reject) => {
    let settled = false
    const socket = new WebSocket(LIGHTSPEED_WEBSOCKET_URL)

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        socket.close()
      } catch {}
      fn()
    }

    const timer = setTimeout(() => finish(() => reject(new Error("Lightspeed lookup timed out"))), TIMEOUT_MS)

    socket.once("open", () => {
      socket.send(
        JSON.stringify({
          action: "dy_lookup",
          host,
          ip: LIGHTSPEED_IP,
          customerId: LIGHTSPEED_CUSTOMER_ID,
        }),
      )
    })

    socket.once("message", (message) => {
      finish(() => {
        try {
          const response = JSON.parse(message.toString())
          resolve(categorize(response.cat))
        } catch (error) {
          reject(error)
        }
      })
    })

    socket.once("error", (error) => finish(() => reject(error)))
  })
