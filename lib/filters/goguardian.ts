import { createDecipheriv, createHash } from "node:crypto"
import goguardianCats from "./data/goguardian.json"
import { blockedResult, fetchWithTimeout, type FilterCheck } from "./types"

// GoGuardian's categories API needs a bearer token, which the reference project
// fetches as an OpenSSL-encrypted blob. Point GOGUARDIAN_TOKEN_URL at a live
// source of that blob, otherwise lookups will return "Error".
const GOGUARDIAN_TOKEN_URL =
  process.env.GOGUARDIAN_TOKEN_URL || "https://raw.githubusercontent.com/supercoolgenizy/superman/refs/heads/main/lol"

const PUBLIC_KEY = "82fdbf93-6361-454a-9460-e03bc2baaeff"
const PASSWORD_PREFIX = "59afe4da-9a47-4cff-b024-c9e8fab53eb1"

const CATS = goguardianCats as unknown as Record<string, [string, boolean]>

// OpenSSL "Salted__" + EVP_BytesToKey(MD5) + AES-256-CBC
function decryptOpenSSL(encryptedB64: string, password: string): string {
  const raw = Buffer.from(encryptedB64.trim(), "base64")
  if (raw.subarray(0, 8).toString("utf8") !== "Salted__") {
    throw new Error("Invalid OpenSSL salt header")
  }
  const salt = raw.subarray(8, 16)
  const ciphertext = raw.subarray(16)

  let derived = Buffer.alloc(0)
  let prev = Buffer.alloc(0)
  while (derived.length < 48) {
    prev = createHash("md5")
      .update(Buffer.concat([prev, Buffer.from(password), salt]))
      .digest()
    derived = Buffer.concat([derived, prev])
  }

  const decipher = createDecipheriv("aes-256-cbc", derived.subarray(0, 32), derived.subarray(32, 48))
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
}

// Token is the same for every lookup, so avoid refetching it per domain.
let cachedToken: { value: string; expires: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.value
  const res = await fetchWithTimeout(`${GOGUARDIAN_TOKEN_URL}?${Date.now()}`)
  const token = decryptOpenSSL(await res.text(), PASSWORD_PREFIX + PUBLIC_KEY)
  cachedToken = { value: token, expires: Date.now() + 5 * 60_000 }
  return token
}

export const goguardian: FilterCheck = async (host) => {
  const token = await getToken()

  const res = await fetchWithTimeout("https://panther.goguardian.com/api/v2/categories", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "extension-version": "4.1.210",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      "content-type": "text/plain;charset=UTF-8",
      accept: "*/*",
      origin: "chrome-extension://haldlgldplgnggkjaafhelgiaglafanh",
    },
    body: JSON.stringify({ cleanUrl: host, rawUrl: host }),
  })

  const data = await res.json()
  if (data.error || !Array.isArray(data.cats)) {
    // An expired/invalid token lands here; drop the cache so the next call refetches.
    cachedToken = null
    throw new Error(data.message || "GoGuardian API returned no categories")
  }

  const known = (data.cats as Array<string | number>).filter((c) => CATS[c]).map((c) => CATS[c])
  return blockedResult(
    known.map(([name]) => name).join(", "),
    known.some(([, blocked]) => blocked),
  )
}
