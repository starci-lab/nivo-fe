import { cn } from "@heroui/react";

/** Full-viewport split between the product visual and the authentication task. */
export const AUTH_PAGE_CLASS_NAME = cn(
  "grid",
  "min-h-dvh",
  "overflow-hidden",
  "bg-background",
  "text-foreground",
  "lg:grid-cols-12"
);

/**
 * Desktop-only visual side of the authentication page.
 *
 * `col-span-7` of 12 approximates the intended 7:6 visual weighting without an arbitrary
 * `grid-template-columns` value, which the closed Tailwind scale does not publish.
 */
export const AUTH_VISUAL_CLASS_NAME = cn(
  "relative",
  "hidden",
  "min-h-dvh",
  "overflow-hidden",
  "bg-foreground",
  "lg:col-span-7",
  "lg:block"
);

/** Crop the product art to the available visual column. */
export const AUTH_VISUAL_IMAGE_CLASS_NAME = cn("object-cover", "object-center");

/** Preserve foreground readability over the product art. */
export const AUTH_VISUAL_SCRIM_CLASS_NAME = cn(
  "absolute",
  "inset-0",
  "bg-gradient-to-b",
  "from-black/20",
  "via-black/5",
  "to-black/80"
);

/** Brand accent at the top edge of the visual column. */
export const AUTH_VISUAL_ACCENT_CLASS_NAME = cn("absolute", "inset-x-0", "top-0", "h-1", "bg-accent");

/**
 * Flat right-side surface that centers the form without a card.
 *
 * Inset stays on `COMMON_SPACING_SCALE` (PADDING-5 to PADDING-6, `p-6` to `p-8`): the scale has no
 * step past `p-8`, so the inset steps once at `sm` and holds rather than escalating further at
 * `lg`/`xl` with off-scale values.
 */
export const AUTH_FORM_REGION_CLASS_NAME = cn(
  "flex",
  "min-h-dvh",
  "items-center",
  "justify-center",
  "px-6",
  "py-8",
  "sm:px-8",
  "lg:col-span-5"
);

/**
 * Readable form measure only. Grammar's leaves own their own size and width: the heading takes its
 * `scale` and the actions take `width="fill"` on the panel itself, so this file never reaches
 * through the boundary with a descendant selector.
 */
export const AUTH_FORM_CONTENT_CLASS_NAME = cn("w-full", "max-w-md");
