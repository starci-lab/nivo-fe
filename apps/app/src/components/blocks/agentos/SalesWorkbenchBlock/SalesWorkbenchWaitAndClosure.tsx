import type { ReactNode } from "react"
import { Badge, Button, Form, Input, Select, SurfaceCard, Text } from "@starci/grammar/common"
import { formatSalesInstant, salesOutcomeKey, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import {
    SALES_LIFECYCLE_TONES,
    SALES_WORK_STATE_TONES,
    salesCloseOutcomeOf,
    salesWorkbenchLifecycleText,
    salesWorkbenchReasonText,
    salesWorkbenchSubmitOn,
    salesWorkbenchToneFor,
    salesWorkbenchWorkStateText,
} from "./sales-workbench.helpers"
import { SALES_FORM_FULL_SPAN_CLASS_NAME, SALES_FORM_GRID_CLASS_NAME } from "./classNames"
import {
    SalesWorkbenchActionRow,
    SalesWorkbenchFieldStack,
    SalesWorkbenchRegion,
    SalesWorkbenchRow,
} from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"

/** Props for the Sales workbench wait unit. */
type SalesWorkbenchWaitProps = SalesWorkbenchSectionProps

/** Draw the current work item and its safe reread action. */
export const SalesWorkbenchWait = (props: SalesWorkbenchWaitProps) => {
    const { view, format, shared } = props.props
    const { t, scopeReady } = view

    const region = (standing: SalesSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => (
        <SalesWorkbenchRegion props={{ ...props.props, standing, empty, emptyHint }}>{children}</SalesWorkbenchRegion>
    )
    const wait = () => (
        <SurfaceCard label={t("wait.label")} fact={view.wait.model === null ? undefined : view.wait.model.customerRef}>
            {region(
                view.wait.standing,
                t("wait.empty"),
                t("wait.emptyHint"),
                view.wait.model === null ? null : (
                    <SalesWorkbenchFieldStack>
                        <SalesWorkbenchActionRow>
                            <Text weight="semibold">{view.wait.model.purpose}</Text>
                            <Badge tone={salesWorkbenchToneFor(SALES_LIFECYCLE_TONES, view.wait.model.status)}>
                                {salesWorkbenchLifecycleText(view.wait.model.status, t)}
                            </Badge>
                            <Badge tone={salesWorkbenchToneFor(SALES_WORK_STATE_TONES, view.wait.model.workState)}>
                                {salesWorkbenchWorkStateText(view.wait.model.workState, t)}
                            </Badge>
                        </SalesWorkbenchActionRow>
                        <SalesWorkbenchRow>
                            <Text size="sm">
                                {t("wait.reason")}: {salesWorkbenchReasonText(view.wait.model.reason, t)}
                            </Text>
                            <Text size="sm">
                                {t("wait.nextStep")}: {salesWorkbenchWorkStateText(view.wait.model.workState, t)}
                            </Text>
                        </SalesWorkbenchRow>
                        <Text size="xs" tone="muted">
                            {t("wait.evidence", {
                                refs:
                                    view.wait.model.evidenceRefs.length === 0
                                        ? t("none")
                                        : view.wait.model.evidenceRefs.join(", "),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("wait.identity", {
                                opportunity: view.wait.model.opportunityId,
                                revision: view.wait.model.revision,
                                customer: view.wait.model.customerRef,
                            })}
                        </Text>
                        {view.wait.model.closedAt === null ? null : (
                            <Text size="xs" tone="muted">
                                {t("wait.closedAt", { at: formatSalesInstant(view.wait.model.closedAt, format) })}
                            </Text>
                        )}
                    </SalesWorkbenchFieldStack>
                ),
            )}
            <Form onSubmit={(_, event) => salesWorkbenchSubmitOn(() => undefined)(event)}>
                <SalesWorkbenchActionRow>
                    <Input
                        id="sales-opportunity-id"
                        name="sales-opportunity-id"
                        label={t("wait.opportunityId")}
                        hint={t("wait.opportunityIdHint")}
                        value={view.wait.opportunityId}
                        onValueChange={view.wait.setOpportunityId}
                    />
                    <Button size="lg" type="button" variant="ghost" onPress={view.wait.reload}>
                        {t("reload")}
                    </Button>
                </SalesWorkbenchActionRow>
            </Form>
        </SurfaceCard>
    )

    return wait()
}

/** Props for the Sales workbench closure unit. */
type SalesWorkbenchClosureProps = SalesWorkbenchSectionProps

/** Draw the durable opportunity closure form and readback. */
export const SalesWorkbenchClosure = (props: SalesWorkbenchClosureProps) => {
    const { view, format, shared } = props.props
    const { t, scopeReady } = view
    const { setOutcome } = props.on
    const lifecycleText = (status: string) => salesWorkbenchLifecycleText(status, t)
    const workStateText = (status: string) => salesWorkbenchWorkStateText(status, t)

    const region = (standing: SalesSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => (
        <SalesWorkbenchRegion props={{ ...props.props, standing, empty, emptyHint }}>{children}</SalesWorkbenchRegion>
    )
    return (
        <SurfaceCard
            label={t("closure.label")}
            fact={view.closure.model === null ? undefined : salesWorkbenchLifecycleText(view.closure.model.status, t)}
        >
            <Form onSubmit={(_, event) => salesWorkbenchSubmitOn(view.closure.onClose)(event)}>
                <div className={SALES_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="sales-close-intent"
                        name="sales-close-intent"
                        label={t("closure.intentId")}
                        hint={t("closure.intentIdHint")}
                        value={view.closure.intentId}
                        onValueChange={view.closure.setIntentId}
                        isRequired
                    />
                    <Input
                        id="sales-close-opportunity"
                        name="sales-close-opportunity"
                        label={t("closure.opportunityId")}
                        value={view.wait.opportunityId}
                        onValueChange={view.wait.setOpportunityId}
                        isRequired
                    />
                    <Select
                        name="sales-close-outcome"
                        label={t("closure.outcome")}
                        options={[
                            { id: "won", label: t(salesOutcomeKey("won")) },
                            { id: "lost", label: t(salesOutcomeKey("lost")) },
                            { id: "attention", label: t(salesOutcomeKey("attention")) },
                        ]}
                        value={view.closure.outcome}
                        onValueChange={(value) => setOutcome(salesCloseOutcomeOf(value ?? "won"))}
                    />
                    <Input
                        id="sales-close-evidence"
                        name="sales-close-evidence"
                        label={t("closure.evidence")}
                        hint={t("evidenceRefsHint")}
                        value={view.closure.evidenceRefs}
                        onValueChange={view.closure.setEvidenceRefs}
                    />
                    <Input
                        id="sales-close-order"
                        name="sales-close-order"
                        label={t("closure.order")}
                        hint={t("closure.orderHint")}
                        value={view.closure.orderId}
                        onValueChange={view.closure.setOrderId}
                    />
                    <Input
                        id="sales-close-revision"
                        name="sales-close-revision"
                        label={t("closure.revision")}
                        hint={t("closure.revisionHint")}
                        value={view.closure.revision}
                        onValueChange={view.closure.setRevision}
                        isRequired
                    />
                    <div className={SALES_FORM_FULL_SPAN_CLASS_NAME}>
                        <SalesWorkbenchActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.closure.isClosing}
                                isDisabled={!scopeReady || !view.closure.addressable}
                            >
                                {t("closure.close")}
                            </Button>
                        </SalesWorkbenchActionRow>
                    </div>
                </div>
            </Form>
            {region(
                view.closure.standing,
                t("wait.empty"),
                t("closure.emptyHint"),
                view.closure.model === null ? null : (
                    <SalesWorkbenchFieldStack>
                        <SalesWorkbenchActionRow>
                            <Badge tone={salesWorkbenchToneFor(SALES_LIFECYCLE_TONES, view.closure.model.status)}>
                                {salesWorkbenchLifecycleText(view.closure.model.status, t)}
                            </Badge>
                            <Badge tone={salesWorkbenchToneFor(SALES_WORK_STATE_TONES, view.closure.model.workState)}>
                                {salesWorkbenchWorkStateText(view.closure.model.workState, t)}
                            </Badge>
                            <Text size="xs" tone="muted">
                                {t("wait.identity", {
                                    opportunity: view.closure.model.opportunityId,
                                    revision: view.closure.model.revision,
                                    customer: view.closure.model.customerRef,
                                })}
                            </Text>
                        </SalesWorkbenchActionRow>
                        {view.closure.model.closedAt === null ? (
                            <Text size="sm" tone="accent">
                                {t("closure.openNote")}
                            </Text>
                        ) : (
                            <Text size="sm" tone="accent">
                                {t("closure.closedAt", { at: formatSalesInstant(view.closure.model.closedAt, format) })}
                            </Text>
                        )}
                    </SalesWorkbenchFieldStack>
                ),
            )}
        </SurfaceCard>
    )
}
