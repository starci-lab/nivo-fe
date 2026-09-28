import { cn } from "@heroui/react";

/** Route-owned width and spacing between Setup navigation and its mounted panel. */
export const AGENTOS_SETUP_SURFACE_CLASS_NAME = cn("w-full", "flex", "min-w-0", "flex-col", "gap-4");
/** Compact application stack within a Setup region. */
export const AGENTOS_SETUP_STACK_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3");
/** Route-owned spacing around Setup prerequisite guidance. */
export const AGENTOS_SETUP_GUARD_CLASS_NAME = cn("w-full", "flex", "min-w-0", "flex-col", "gap-4");

/** Application spacing and separator for joined context content. */
export const CONTEXT_BAND_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4", "border-t", "border-separator");
/** Application inset and recessed face for the context summary. */
export const CONTEXT_RAISED_BAND_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4", "bg-surface-secondary", "text-foreground");
