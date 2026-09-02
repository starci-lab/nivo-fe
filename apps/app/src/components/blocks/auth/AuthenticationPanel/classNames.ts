import { cn } from "@heroui/react";

/** Vertical rhythm shared by every authentication state. */
export const AUTH_PANEL_CLASS_NAME = cn("flex", "flex-col", "gap-6");

/** Title and subtitle stay visually coupled. */
export const AUTH_PANEL_HEADER_CLASS_NAME = cn("flex", "flex-col", "gap-3");

/** Supporting notice title and body. */
export const AUTH_PANEL_NOTICE_CLASS_NAME = cn("flex", "flex-col", "gap-2");

/** Notice status and onward action. */
export const AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME = cn("flex", "flex-col", "gap-3");

/** Primary provider group and credential form separation. */
export const AUTH_PANEL_DETAILS_CLASS_NAME = cn("flex", "flex-col", "gap-6");

/** Provider shortcut and its alternative divider. */
export const AUTH_PANEL_PROVIDER_CLASS_NAME = cn("flex", "flex-col", "gap-3");

/** Credentials and their submit controls form one semantic unit. */
export const AUTH_PANEL_FORM_CLASS_NAME = cn("flex", "flex-col", "gap-4");

/** Sign-in options share one row and retain separation on narrow widths. */
export const AUTH_PANEL_OPTIONS_CLASS_NAME = cn("!flex", "items-center", "justify-between", "gap-4");

/** Secondary text actions wrap cleanly instead of overflowing. */
export const AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME = cn(
  "flex",
  "flex-wrap",
  "items-center",
  "gap-x-3",
  "gap-y-2"
);

/** Prompt and journey switch are read as one sentence. */
export const AUTH_PANEL_FOOTER_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-2");
