import { cn } from "@heroui/react";

/** Class for text that serves as the visible label of a press target. */
export const TEXT_PRESS_LABEL_CLASS_NAME = cn("text-press-label");
/** Typography variants remain visible to Tailwind while the leaf chooses them semantically. */
export const TEXT_CLASS_NAME = cn(
  "text-base", "leading-6", "font-normal", "text-foreground",
  "data-[size=xs]:text-xs", "data-[size=xs]:leading-4", "data-[size=xs]:text-muted",
  "data-[size=sm]:text-sm", "data-[size=sm]:leading-5",
  "data-[size=metric-lead]:text-3xl", "data-[size=metric-lead]:leading-9",
  "data-[tone=muted]:text-muted", "data-[tone=accent]:text-accent-soft-foreground",
  "data-[weight=medium]:font-medium", "data-[weight=semibold]:font-semibold",
  "data-[icon=true]:inline-flex", "data-[icon=true]:items-center", "data-[icon=true]:gap-2"
);
