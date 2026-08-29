import { cn } from "@heroui/react";

/** Frame classes for authored academy imagery. */
export const FIGURE_CLASS_NAME = cn("rounded-xl", "border", "border-border", "bg-surface-secondary");

/** Image classes that preserve the authored figure frame. */
export const FIGURE_IMAGE_CLASS_NAME = cn("h-full", "w-full", "rounded-xl", "object-cover");

/** Placeholder artwork classes used when an image is absent or unavailable. */
export const FIGURE_PLACEHOLDER_CLASS_NAME = cn("h-full", "w-full", "opacity-25");

/** Form control classes for the academy lead form. */
export const LEAD_INPUT_CLASS_NAME = cn("rounded-lg", "border", "border-border", "bg-surface", "px-3", "py-2", "text-sm");

/** Quote classes for authored academy testimonials. */
export const QUOTE_CLASS_NAME = cn("border-l-2", "border-border", "pl-3");

/** Emphasized quote classes for authored academy quote sections. */
export const PULL_QUOTE_CLASS_NAME = cn("border-l-4", "border-accent", "pl-4", "text-xl", "font-medium", "leading-snug");

/** Body classes for authored multiline academy content. */
export const CUSTOM_BODY_CLASS_NAME = cn("whitespace-pre-line", "text-muted");
