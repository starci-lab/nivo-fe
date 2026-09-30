import { cn } from "@heroui/react"

/** The busy region adds no box of its own: the skeleton it holds keeps the layout the resolved content will take. */
export const LOADING_REGION_CLASS_NAME = cn("contents")

/** The status sentence is read by assistive technology and never drawn. */
export const LOADING_STATUS_CLASS_NAME = cn("sr-only")
