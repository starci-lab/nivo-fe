import { cn } from "@heroui/react"
import type { ProductBlockContext } from "@/modules/product/types"

/** Status alignment and the responsibility definition card surface. */
export const productStatusClassName = (context: ProductBlockContext) =>
    cn(
        "flex",
        "flex-wrap",
        "items-center",
        "gap-3",
        context.page === "systemOfResponsibility" && context.section.id === "definition" && "max-w-[52rem]",
        context.page === "systemOfResponsibility" && context.section.id === "definition" && "rounded-3xl",
        context.page === "systemOfResponsibility" && context.section.id === "definition" && "bg-surface/72",
        context.page === "systemOfResponsibility" && context.section.id === "definition" && "p-6",
        context.page === "systemOfResponsibility" &&
            context.section.id === "definition" &&
            "shadow-[var(--product-status-shadow)]",
    )
