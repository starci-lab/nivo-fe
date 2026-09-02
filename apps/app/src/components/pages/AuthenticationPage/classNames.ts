import { cn } from "@heroui/react";

/** Full-viewport split between the product visual and the authentication task. */
export const AUTH_PAGE_CLASS_NAME = cn(
  "grid",
  "min-h-dvh",
  "overflow-hidden",
  "bg-background",
  "text-foreground",
  "lg:grid-cols-[7fr_6fr]"
);

/** Desktop-only visual side of the authentication page. */
export const AUTH_VISUAL_CLASS_NAME = cn(
  "relative",
  "hidden",
  "min-h-dvh",
  "overflow-hidden",
  "bg-foreground",
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

/** Flat right-side surface that centers the form without a card. */
export const AUTH_FORM_REGION_CLASS_NAME = cn(
  "flex",
  "min-h-dvh",
  "items-center",
  "justify-center",
  "px-6",
  "py-10",
  "sm:px-10",
  "lg:px-14",
  "lg:py-10",
  "xl:px-20"
);

/** Readable form measure plus page-level control sizing. */
export const AUTH_FORM_CONTENT_CLASS_NAME = cn(
  "w-full",
  "max-w-md",
  "[&_[data-slot=button]]:w-full",
  "[&_h2]:!text-3xl",
  "[&_h2]:!leading-tight",
  "sm:[&_h2]:!text-4xl"
);
