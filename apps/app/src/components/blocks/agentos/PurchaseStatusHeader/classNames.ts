import { cn } from "@heroui/react"

/** Keep breadcrumb steps inline and wrap them within the page width. */
export const BREADCRUMB_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** Reserve the resolved provisioning title's narrow-screen height during loading. */
export const SKELETON_TITLE_RESERVED_CLASS_NAME = cn("block", "max-[540px]:min-h-[49px]")
