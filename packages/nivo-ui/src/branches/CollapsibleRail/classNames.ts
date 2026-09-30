import { cn } from "@heroui/styles"

/** Root classes for the responsive navigation rail: hidden below 48rem, a flex track above it, closed by a separator on its inline end. */
export const RAIL_CLASS_NAME = cn("hidden", "border-e", "border-separator", "text-foreground", "md:flex")

/** Visually hidden name of the rail's collapse control. */
export const SCREEN_READER_ONLY_CLASS_NAME = "sr-only"
