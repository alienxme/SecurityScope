import type { FilterKey } from "./meta"
import type { FilterCheck } from "./types"
import { blocksiAI, blocksiStandard } from "./blocksi"
import { cisco } from "./cisco"
import { fortiguard } from "./fortiguard"
import { goguardian } from "./goguardian"
import { lanschool } from "./lanschool"
import { lightspeed } from "./lightspeed"
import { linewize } from "./linewize"
import { senso } from "./senso"

// Server-only: maps each filter key from ./meta to its implementation.
export const CHECKERS: Record<FilterKey, FilterCheck> = {
  lightspeed,
  fortiguard,
  cisco,
  goguardian,
  linewize,
  blocksi: blocksiStandard,
  blocksiai: blocksiAI,
  senso,
  lanschool,
}
