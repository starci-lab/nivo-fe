import { cn } from "@heroui/react";

/**
 * The quiet canvas that carries one authentication task, and the mascot beside it on wide screens.
 *
 * ONE SURFACE, ONE MEASURE, ONE TASK. The accepted direction draws the page slot as a centred
 * external heading over one soft borderless form surface, with the exits below it rather than
 * inside it - so this file owns the canvas, the column and the reserved area, and the width of the
 * surface itself is Grammar's `formCompact` measure rather than a number written here. A second
 * measure in this file would be a second thing that can disagree with the design system.
 *
 * THE ARTWORK COLUMN IS RESERVED, NOT DRAWN. It stays empty on every state but sign-in-ready, and
 * it leaves the reading order entirely below `lg` (`hidden` + `lg:block`), so a narrow reader gets
 * one column and one task.
 */
export const AUTH_PAGE_CLASS_NAME = cn(
  "grid",
  "min-h-dvh",
  "content-center",
  "justify-items-center",
  "gap-10",
  "bg-background",
  "p-6",
  "text-foreground",
  "sm:p-8",
  "lg:grid-cols-12",
  "lg:gap-12",
  "lg:px-16"
);

/** The one task column: heading, surface and exits, stacked and centred as one measure. */
export const AUTH_TASK_COLUMN_CLASS_NAME = cn(
  "flex",
  "w-full",
  "flex-col",
  "items-center",
  "gap-6",
  "lg:col-span-6",
  "lg:col-start-4"
);

/** Heading and the line under it, centred above the surface. */
export const AUTH_HEADING_CLASS_NAME = cn("flex", "flex-col", "items-center", "gap-2", "text-center");

/** The exits below the surface: what to do instead, and the way back from a challenge. */
export const AUTH_EXITS_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "justify-center", "gap-x-4", "gap-y-2", "text-center");

/** One exit: an optional question, and the action that answers it. */
export const AUTH_EXIT_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-2");

/**
 * The reserved right-side area of the desktop direction, holding the canonical mascot band.
 *
 * `justify-self-stretch` is what gives the band a width at all: the mascot slot is a full-width
 * band, and a centred grid item would otherwise shrink to the artwork's own 180 pixels.
 */
export const AUTH_VIGNETTE_CLASS_NAME = cn(
  "hidden",
  "lg:col-span-3",
  "lg:col-start-10",
  "lg:block",
  "lg:justify-self-stretch"
);