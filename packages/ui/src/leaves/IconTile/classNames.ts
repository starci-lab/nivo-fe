import { cn } from "@heroui/react";
import type { IconTileSize, IconTileTone } from "./index";

/** Stable class recipes for the filled icon plate. */
export const ICON_TILE_BASE_CLASS_NAME = cn("inline-flex", "shrink-0", "items-center", "justify-center");
/** Size recipes keep the plate dimensions paired with its corner radius. */
export const ICON_TILE_SIZE_CLASS_NAMES: Record<IconTileSize, ReturnType<typeof cn>> = {
  sm: cn("size-8", "rounded-lg"),
  md: cn("size-10", "rounded-xl")
};
/** Tone recipes keep each fill paired with its readable foreground. */
export const ICON_TILE_TONE_CLASS_NAMES: Record<IconTileTone, ReturnType<typeof cn>> = {
  neutral: cn("bg-default", "text-muted"),
  accent: cn("bg-accent-soft", "text-accent-soft-foreground"),
  success: cn("bg-success-soft", "text-success-soft-foreground"),
  warning: cn("bg-warning-soft", "text-warning-soft-foreground"),
  danger: cn("bg-danger-soft", "text-danger-soft-foreground")
};
