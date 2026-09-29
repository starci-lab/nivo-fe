import { cn } from "@heroui/react"

/** Keep catalogue offers and their tiers as compact selection groups. */
export const OFFER_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "border-b", "border-separator", "p-4", "last:border-b-0")
/** Group selectable tier controls while allowing long labels to wrap. */
export const TIER_ACTIONS_CLASS_NAME = cn("flex", "flex-wrap", "gap-2")
