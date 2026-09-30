import { Fragment } from "react"
import { cn } from "@heroui/react"
import { SectionHeader, Text, TextAction } from "@starci/grammar/common"

const BREADCRUMB_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")

/** One linked or current step in an AgentOS checkout breadcrumb. */
type CheckoutFlowBreadcrumb = {
    readonly label: string
    readonly href?: string
    readonly isCurrent?: boolean
}

/** Shared heading and breadcrumb content for the offer and checkout surfaces. */
type CheckoutFlowHeadProps = {
    readonly accessibilityLabel: string
    readonly breadcrumbs: ReadonlyArray<CheckoutFlowBreadcrumb>
    readonly title: string
    readonly description: string
}

/** Render the common heading and semantic breadcrumb for an AgentOS checkout surface. */
export const CheckoutFlowHead = (props: CheckoutFlowHeadProps) => (
    <>
        <nav aria-label={props.accessibilityLabel}>
            <ol className={BREADCRUMB_LIST_CLASS_NAME}>
                {props.breadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={`${index}-${breadcrumb.label}`}>
                        {index === 0 ? null : (
                            <li aria-hidden="true">
                                <Text size="sm" tone="muted">
                                    ›
                                </Text>
                            </li>
                        )}
                        <li aria-current={breadcrumb.isCurrent ? "page" : undefined}>
                            {breadcrumb.href === undefined ? (
                                <Text size="sm" tone="muted">
                                    {breadcrumb.label}
                                </Text>
                            ) : (
                                <TextAction href={breadcrumb.href} size="sm">
                                    {breadcrumb.label}
                                </TextAction>
                            )}
                        </li>
                    </Fragment>
                ))}
            </ol>
        </nav>
        <SectionHeader
            level={1}
            title={props.title}
            description={
                <Text size="md" tone="muted">
                    {props.description}
                </Text>
            }
        />
    </>
)
