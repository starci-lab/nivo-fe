import { cn } from "@heroui/styles"

/** Visually hides the rail heading while retaining its landmark semantics. */
export const RAIL_HEADING_CLASS_NAME = cn("sr-only")

/** Root classes for the responsive navigation rail: hidden below 48rem, a flex track above it. */
export const RAIL_CLASS_NAME = cn("hidden", "text-foreground", "md:flex")
