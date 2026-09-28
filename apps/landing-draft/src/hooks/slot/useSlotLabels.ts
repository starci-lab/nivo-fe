import { SLOT_STATUS_COPY } from "@/modules/slot/copy";
import type { SlotLabels } from "@/modules/slot";

/**
 * Resolves the shared data-status copy once, adding the slot's own empty sentence.
 * The signature matches the published seam (`useSlotLabels()` returns the resolver), so the day a
 * message namespace lands only the source inside changes - never a call site.
 */
export const useSlotLabels = () => {
  return (empty: string): SlotLabels => ({
    empty,
    forbidden: SLOT_STATUS_COPY.forbidden,
    error: SLOT_STATUS_COPY.error,
    retry: SLOT_STATUS_COPY.retry,
  });
};
