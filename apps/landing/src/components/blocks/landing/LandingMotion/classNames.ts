import { cn } from "@heroui/react";

/** Component-owned motion hooks; callers select meaning, never CSS. */
export const CLASS_NAMES = {
  heroCopy: cn("hero-copy"),
  sectionHeadingLight: cn("section-heading", "inverse"),
  visualOverlay: cn("visual-overlay"),
  responsibilityGraph: cn("responsibility-graph"),
  loopTrackShell: cn("loop-track-shell"),
} as const;
