import { cn } from "@heroui/styles"

/** Root classes for the responsive navigation rail: hidden below 48rem, a flex track above it, closed by a separator on its inline end. */
export const RAIL_CLASS_NAME = cn("hidden", "border-e", "border-separator", "text-foreground", "md:flex")
