import { cn } from "@heroui/react";

/** Inset joined content for the AgentOS operational summary. */
export const AGENT_OS_SUMMARY_CONTENT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-4",
  "p-4"
);

/** Workspace identity and status row. */
export const AGENT_OS_SUMMARY_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-start",
  "gap-3"
);

/** Workspace name and description grouping. */
export const AGENT_OS_SUMMARY_COPY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-1",
  "flex-col",
  "gap-1"
);

/** Fixed-width workspace status owner. */
export const AGENT_OS_SUMMARY_STATUS_CLASS_NAME = cn("shrink-0");

/** Horizontal owner for the workspace command. */
export const AGENT_OS_SUMMARY_ACTION_CLASS_NAME = cn("flex", "items-center");

/** Overflow-safe runtime detail owner. */
export const AGENT_OS_SUMMARY_DETAIL_CLASS_NAME = cn("min-w-0");
