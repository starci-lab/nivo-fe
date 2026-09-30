import { Badge, SectionHeader, Text, TextAction } from "@starci/grammar/common"
import type { PurchaseStatusHeadProps } from "@/modules/agentos/purchase-status/view-model"
import { BREADCRUMB_LIST_CLASS_NAME, SKELETON_TITLE_RESERVED_CLASS_NAME } from "./classNames"

/** Inputs resolved by the purchase-status owner for the heading region. */
type PurchaseStatusHeaderProps = {
    readonly head: PurchaseStatusHeadProps
    readonly reserveResolvedTitle?: boolean
}

/** Draw the purchase-status breadcrumb and state heading. */
export const PurchaseStatusHeader = (props: PurchaseStatusHeaderProps) => {
    const { head, reserveResolvedTitle = false } = props
    return (
        <>
            <nav aria-label={head.copy.path}>
                <ol className={BREADCRUMB_LIST_CLASS_NAME}>
                    {head.trail.map((step, index) => (
                        <li
                            key={step.id}
                            className={BREADCRUMB_LIST_CLASS_NAME}
                            aria-current={step.isCurrent === true ? "page" : undefined}
                        >
                            {index > 0 ? (
                                <span aria-hidden="true">
                                    <Text size="sm" tone="muted">
                                        ›
                                    </Text>
                                </span>
                            ) : null}
                            {step.isCurrent === true || step.href === undefined ? (
                                <Text size="sm" tone="muted">
                                    {step.label}
                                </Text>
                            ) : (
                                <TextAction href={step.href} size="sm">
                                    {step.label}
                                </TextAction>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
            <SectionHeader
                level={1}
                title={
                    <span className={reserveResolvedTitle ? SKELETON_TITLE_RESERVED_CLASS_NAME : undefined}>
                        {head.title}
                        {head.badge === undefined ? null : (
                            <>
                                {" "}
                                <Badge tone={head.badge.tone}>{head.badge.label}</Badge>
                            </>
                        )}
                    </span>
                }
                description={
                    <Text size="md" tone="muted">
                        {head.subtitle}
                    </Text>
                }
            />
        </>
    )
}
