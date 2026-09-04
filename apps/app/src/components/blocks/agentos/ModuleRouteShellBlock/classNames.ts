import { cn } from "@heroui/react";

/** Route header width and regional spacing supplied by the application. */
export const MODULE_ROUTE_SHELL_CLASS_NAME = cn("w-full", "flex", "min-w-0", "flex-col", "gap-4", "break-words");
/** Compact identity stack within the module header. */
export const MODULE_ROUTE_SHELL_IDENTITY_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");
/** Wrapping for long module identifiers within the header. */
export const MODULE_ROUTE_SHELL_DETAIL_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");
