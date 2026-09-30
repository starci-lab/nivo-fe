import type { ReactNode } from "react"
import {
    SalesWorkbenchActionRow,
    SalesWorkbenchFieldStack,
    SalesWorkbenchRegion,
    SalesWorkbenchRow,
} from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"
import { Button, Form, Input, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common"
import { formatSalesInstant, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import { SALES_FORM_FULL_SPAN_CLASS_NAME, SALES_FORM_GRID_CLASS_NAME } from "./classNames"
import { SalesWorkbenchAttentionRow } from "./SalesWorkbenchAttentionRow"
import { salesWorkbenchSubmitOn } from "./sales-workbench.helpers"

/** Props for the command and attention Sales workbench unit. */
type SalesWorkbenchCommandAttentionProps = SalesWorkbenchSectionProps

/** Draw the command and attention Sales workbench unit from settled view data. */
export const SalesWorkbenchCommandAttention = (props: SalesWorkbenchCommandAttentionProps) => {
    const { view, format, shared } = props.props
    const { t, scopeReady } = view
    const { selectOpportunity } = props.on

    const region = (standing: SalesSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => (
        <SalesWorkbenchRegion props={{ ...props.props, standing, empty, emptyHint }}>{children}</SalesWorkbenchRegion>
    )
    const commandBand = () => (
        <SurfaceCard label={t("command.label")} fact={t("attention.covered", { count: view.attention.total })}>
            <Form onSubmit={(_, event) => salesWorkbenchSubmitOn(view.command.onSubmit)(event)}>
                <div className={SALES_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="sales-command-id"
                        name="sales-command-id"
                        label={t("command.commandId")}
                        hint={t("command.commandIdHint")}
                        value={view.command.commandId}
                        onValueChange={view.command.setCommandId}
                        isRequired
                    />
                    <Input
                        id="sales-command-outcome"
                        name="sales-command-outcome"
                        label={t("command.outcome")}
                        hint={t("command.outcomeHint")}
                        value={view.command.requestedActions}
                        onValueChange={view.command.setRequestedActions}
                        isRequired
                    />
                    <Input
                        id="sales-command-revision"
                        name="sales-command-revision"
                        label={t("command.revision")}
                        value={view.command.commandRevision}
                        onValueChange={view.command.setCommandRevision}
                        isRequired
                    />
                    <Input
                        id="sales-command-customer-refs"
                        name="sales-command-customer-refs"
                        label={t("command.customerRefs")}
                        hint={t("command.identityHint")}
                        value={view.command.customerRefs}
                        onValueChange={view.command.setCustomerRefs}
                    />
                    <Input
                        id="sales-command-opportunity-ids"
                        name="sales-command-opportunity-ids"
                        label={t("command.opportunityIds")}
                        hint={t("command.identityHint")}
                        value={view.command.opportunityIds}
                        onValueChange={view.command.setOpportunityIds}
                    />
                    <Input
                        id="sales-command-offer-refs"
                        name="sales-command-offer-refs"
                        label={t("command.offerRefs")}
                        hint={t("command.identityHint")}
                        value={view.command.offerRefs}
                        onValueChange={view.command.setOfferRefs}
                    />
                    <Input
                        id="sales-command-fingerprint"
                        name="sales-command-fingerprint"
                        label={t("command.fingerprint")}
                        hint={t("command.fingerprintHint")}
                        value={view.command.fingerprint}
                        onValueChange={view.command.setFingerprint}
                        isRequired
                    />
                    <Input
                        id="sales-command-guards"
                        name="sales-command-guards"
                        label={t("command.guards")}
                        hint={t("command.guardsHint")}
                        value={view.command.expectedRevisions}
                        onValueChange={view.command.setExpectedRevisions}
                    />
                    <div className={SALES_FORM_FULL_SPAN_CLASS_NAME}>
                        <SalesWorkbenchActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.command.isSubmitting}
                                isDisabled={!scopeReady || !view.command.addressable}
                            >
                                {t("command.submit")}
                            </Button>
                        </SalesWorkbenchActionRow>
                        {view.command.actions.length === 0 ? null : (
                            <Text size="xs" tone="muted">
                                {t("command.acceptedActions", { actions: view.command.actions.join(", ") })}
                            </Text>
                        )}
                    </div>
                </div>
            </Form>
        </SurfaceCard>
    )
    const attention = () => (
        <SurfaceListCard
            label={t("attention.list")}
            fact={t("attention.covered", { count: view.attention.rows.length })}
            isLoading={view.attention.standing === "loading"}
        >
            {region(
                view.attention.standing,
                t("attention.empty"),
                t("attention.emptyHint"),
                <SalesWorkbenchFieldStack>
                    {view.attention.rows.map((row) => (
                        <SalesWorkbenchAttentionRow
                            key={row.opportunityId}
                            row={row}
                            scopeReady={scopeReady}
                            t={t}
                            selectOpportunity={selectOpportunity}
                        />
                    ))}
                    {view.attention.observedAt === null ? null : (
                        <Text size="xs" tone="muted">
                            {t("attention.observedAt", { at: formatSalesInstant(view.attention.observedAt, format) })}
                        </Text>
                    )}
                    {view.attention.nextAfter === null ? null : (
                        <Button
                            size="lg"
                            variant="secondary"
                            isPending={view.attention.isLoading}
                            onPress={view.attention.loadMore}
                        >
                            {shared.loadMore}
                        </Button>
                    )}
                </SalesWorkbenchFieldStack>,
            )}
            <SalesWorkbenchActionRow>
                <Button size="lg" variant="ghost" onPress={view.attention.retry}>
                    {t("reload")}
                </Button>
            </SalesWorkbenchActionRow>
        </SurfaceListCard>
    )

    return (
        <>
            {commandBand()}
            {attention()}
        </>
    )
}
