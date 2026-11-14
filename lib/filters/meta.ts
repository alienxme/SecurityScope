// Client-safe filter registry (no server imports). The UI and the API route
// both read from this, so adding a filter means: one entry here + one module.

export const FILTERS = [
  { key: "lightspeed", label: "Lightspeed", defaultOn: true },
  { key: "fortiguard", label: "FortiGuard", defaultOn: true },
  { key: "cisco", label: "Cisco Talos", defaultOn: false },
  { key: "goguardian", label: "GoGuardian", defaultOn: false },
  { key: "linewize", label: "Linewize", defaultOn: false },
  { key: "blocksi", label: "Blocksi", defaultOn: false },
  { key: "blocksiai", label: "Blocksi AI", defaultOn: false },
  { key: "senso", label: "Senso", defaultOn: false },
  { key: "lanschool", label: "LanSchool", defaultOn: false },
] as const

export type FilterKey = (typeof FILTERS)[number]["key"]

export type FilterStatus = "Blocked" | "Unblocked" | "Unknown" | "Error" | "Not Checked"

export interface FilterResult {
  status: FilterStatus
  category: string
}

export type FilterSelection = Record<FilterKey, boolean>

export type DomainResult = { url: string } & Record<FilterKey, FilterResult>

export const defaultFilterSelection = (): FilterSelection =>
  Object.fromEntries(FILTERS.map((f) => [f.key, f.defaultOn])) as FilterSelection
