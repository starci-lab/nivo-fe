import { cn } from "@heroui/react";

/** Inset joined content for wallet evidence and actions. */
export const WALLET_SUMMARY_CONTENT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-4",
  "p-4"
);

/** Vertical grouping for balance and invoice facts. */
export const WALLET_SUMMARY_FACTS_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-3"
);

/** Label and value grouping for one wallet fact. */
export const WALLET_SUMMARY_FACT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1"
);

/** Horizontal owner for the wallet command. */
export const WALLET_SUMMARY_ACTION_CLASS_NAME = cn("flex", "items-center");

/** Overflow-safe wallet note owner. */
export const WALLET_SUMMARY_NOTE_CLASS_NAME = cn("min-w-0");
