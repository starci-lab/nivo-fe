import { cn } from "@heroui/react";

/** Component-owned motion hooks; callers select meaning, never CSS. */
export const CLASS_NAMES = {
  heroCopy: cn("hero-copy"),
  sectionHeadingLight: cn("section-heading", "light"),
  visualOverlay: cn("visual-overlay"),
} as const;
