import { cn } from "@heroui/react";

/** Application spacing and separator for joined context content. */
export const CONTEXT_BAND_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4", "border-t", "border-separator");
/** Application inset and recessed face for the context summary. */
export const CONTEXT_RAISED_BAND_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4", "bg-surface-secondary", "text-foreground");
/** Application wrapping and separation for repeated readiness evidence. */
export const CONTEXT_GATE_ROW_CLASS_NAME = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2", "border-t", "border-separator", "py-3");
