import { cn } from "@heroui/react"

/** Stable process-flow utilities that do not depend on a caller's layout. */
export const CLASS_NAMES = {
    index: cn("flex", "min-h-4", "items-center", "text-home-micro", "font-bold", "tracking-home-eyebrow", "opacity-[0.65]"),
    inverseIndex: "text-landing-inverse-muted",
    node: cn(
        "relative",
        "z-[1]",
        "w-4",
        "aspect-square",
        "self-center",
        "rounded-full",
        "border-[3px]",
        "border-surface",
        "bg-accent",
        "shadow-[0_0_0_1px_var(--accent)]",
        "[@media(max-width:48rem)]:mt-[0.1rem]",
        "forced-colors:border-[Canvas]",
        "forced-colors:bg-[Highlight]",
        "forced-colors:shadow-[0_0_0_1px_CanvasText]",
    ),
    copy: cn(
        "flex",
        "min-w-0",
        "flex-col",
        "gap-[0.4rem]",
        "py-[0.2rem]",
        "pr-4",
        "leading-6",
        "[@media(max-width:48rem)]:min-h-0",
        "[@media(max-width:48rem)]:pr-0",
        "[&>span:first-child]:min-h-10",
        "[@media(max-width:48rem)]:[&>span:first-child]:min-h-0",
    ),
} as const

/** Select the number of columns and inverse surface from semantic flow props. */
export const processFlowClassName = (columns: 4 | 5, inverse: boolean, centered: boolean) =>
    cn(
        "grid",
        "p-0",
        "m-0",
        "list-none",
        columns === 4 && "grid-cols-4",
        columns === 5 && "grid-cols-5",
        inverse && "text-surface",
        centered && "mt-home-relevance-top",
        "[@media(max-width:48rem)]:grid-cols-1",
        "[@media(max-width:48rem)]:gap-0",
    )

/** Align the flow node and connecting line to the selected presentation. */
export const processFlowStepClassName = (inverse: boolean, centered: boolean) =>
    cn(
        "relative",
        "grid",
        "min-w-0",
        "grid-rows-home-process-step",
        "items-start",
        "gap-3",
        "pr-4",
        "after:absolute",
        "after:top-[2.48rem]",
        "after:right-0",
        "after:left-[1.6rem]",
        "after:h-px",
        "after:bg-border",
        "after:content-['']",
        "last:after:hidden",
        inverse && "after:bg-landing-inverse-line",
        centered && "justify-items-center",
        centered && "px-3",
        centered && "text-center",
        centered && "after:right-[calc(-50%_+_0.75rem)]",
        centered && "after:left-[calc(50%_+_0.75rem)]",
        "[@media(max-width:48rem)]:grid-cols-home-process-mobile",
        "[@media(max-width:48rem)]:grid-rows-[auto]",
        "[@media(max-width:48rem)]:gap-3",
        "[@media(max-width:48rem)]:p-0",
        "[@media(max-width:48rem)]:pb-8",
        "[@media(max-width:48rem)]:after:top-4",
        "[@media(max-width:48rem)]:after:right-auto",
        "[@media(max-width:48rem)]:after:bottom-0",
        "[@media(max-width:48rem)]:after:left-11",
        "[@media(max-width:48rem)]:after:h-auto",
        "[@media(max-width:48rem)]:after:w-px",
        centered && "[@media(max-width:48rem)]:justify-items-start",
        centered && "[@media(max-width:48rem)]:px-0",
        centered && "[@media(max-width:48rem)]:text-left",
        centered && "[@media(max-width:48rem)]:after:right-auto",
        centered && "[@media(max-width:48rem)]:after:left-11",
    )

/** Emphasize one process node while preserving the regular node geometry. */
export const processFlowNodeClassName = (emphasized: boolean) =>
    cn(
        CLASS_NAMES.node,
        emphasized && "w-6",
        emphasized && "mt-0",
        emphasized && "shadow-landing-home-flow-emphasis",
        emphasized && "[@media(max-width:48rem)]:-mt-[0.15rem]",
        emphasized && "[@media(max-width:48rem)]:-ml-1",
    )

/** Give the numbered marker its default or inverse ink role. */
export const processFlowIndexClassName = (inverse: boolean) =>
    cn(CLASS_NAMES.index, inverse && CLASS_NAMES.inverseIndex)

/** Align the flow copy and apply inverse grammar text roles where selected. */
export const processFlowCopyClassName = (centered: boolean, inverse: boolean) =>
    cn(
        CLASS_NAMES.copy,
        centered && "items-center",
        centered && "[@media(max-width:48rem)]:items-start",
        inverse && "[&>[data-component=Text]:first-child]:text-surface",
        inverse && "[&>[data-component=Text]:last-child]:text-landing-inverse-muted",
    )
