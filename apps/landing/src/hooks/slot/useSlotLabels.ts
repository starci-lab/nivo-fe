import type { SlotLabels } from "@/modules/slot"

/** Local copy adapter stub until the shared message seam is published. */
export const useSlotLabels = (labels: Omit<SlotLabels, "empty">) => (empty: string): SlotLabels => ({
    empty,
    ...labels,
})
