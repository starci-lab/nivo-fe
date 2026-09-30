import type { ReactNode } from "react"
import type { AccountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import { Badge, Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import {
    accountingFactFieldKey,
    accountingMatchStatusKey,
    accountingTreatmentKey,
} from "@/modules/accounting/accounting-workbench"
import {
    AccountingWorkbenchActionRow,
    AccountingWorkbenchFieldStack,
    AccountingWorkbenchRow,
} from "./accounting-workbench.shared"
import { accountingSubmitOn } from "./accounting-workbench.helpers"
import { ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME, ACCOUNTING_FORM_GRID_CLASS_NAME } from "./classNames"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchRegion } from "./accounting-workbench.shared"

/** Props for the detail accounting workbench unit. */
type AccountingWorkbenchDetailProps = { readonly props: AccountingWorkbenchSectionData }

/** Draw the detail accounting workbench section from settled view data. */
export const AccountingWorkbenchDetail = (props: AccountingWorkbenchDetailProps) => {
    const { view, shared, scopeReady } = props.props
    const { t } = view
    const amount = view.format.amount
    

    const region = (
        standing: AccountingSurfaceStanding,
        empty: string,
        emptyHint: string,
        children: ReactNode,
    ) => (
        <AccountingWorkbenchRegion
            props={{ view, shared, scopeReady, standing, empty, emptyHint }}
        >
            {children}
        </AccountingWorkbenchRegion>
    )
    return (
        <SurfaceCard
            label={t("detail.label")}
            fact={view.detail.model === null ? undefined : t(`detail.${view.detail.model.state}`)}
        >
            <form onSubmit={accountingSubmitOn(view.detail.onLoad)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-result-id"
                        name="accounting-result-id"
                        label={t("detail.resultId")}
                        value={view.detail.resultId}
                        onValueChange={view.detail.setResultId}
                    />
                    <Input
                        id="accounting-detail-item-id"
                        name="accounting-detail-item-id"
                        label={t("detail.itemId")}
                        hint={t("detail.asOfHint")}
                        value={view.detail.itemId}
                        onValueChange={view.detail.setItemId}
                    />
                    <Input
                        id="accounting-as-of"
                        name="accounting-as-of"
                        label={t("detail.asOf")}
                        hint={t("detail.asOfFormat")}
                        value={view.detail.asOfInstant}
                        onValueChange={view.detail.setAsOfInstant}
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <AccountingWorkbenchActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.detail.isFetching}
                                isDisabled={
                                    !scopeReady ||
                                    (view.detail.asOfInstant.length === 0
                                        ? view.detail.resultId.length === 0
                                        : view.detail.itemId.length === 0)
                                }
                            >
                                {t("detail.load")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.detail.retry}>
                                {t("reload")}
                            </Button>
                        </AccountingWorkbenchActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.detail.standing,
                t("detail.empty"),
                t("detail.emptyHint"),
                view.detail.model === null ? null : (
                    <AccountingWorkbenchFieldStack>
                        <AccountingWorkbenchActionRow>
                            <Badge tone={view.detail.model.state === "current" ? "neutral" : "warning"}>
                                {t(`detail.${view.detail.model.state}`)}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.detail.model.version })}</Badge>
                            <Text size="xs" tone="muted">
                                {t("detail.effectiveAt", {
                                    at: view.format.instant(view.detail.model.effectiveAt),
                                })}
                            </Text>
                        </AccountingWorkbenchActionRow>
                        <AccountingWorkbenchRow>
                            <Text size="sm">
                                {t(accountingFactFieldKey("amountMinor"))}:{" "}
                                {view.detail.model.facts.amountMinor === null ||
                                view.detail.model.facts.currency === null
                                    ? t("none")
                                    : amount(view.detail.model.facts.amountMinor, view.detail.model.facts.currency)}
                            </Text>
                            <Text size="sm">
                                {t(accountingFactFieldKey("occurredOn"))}:{" "}
                                {view.detail.model.facts.occurredOn ?? t("none")}
                            </Text>
                            <Text size="sm">
                                {t(accountingFactFieldKey("counterpartyRef"))}:{" "}
                                {view.detail.model.facts.counterpartyRef ?? t("none")}
                            </Text>
                        </AccountingWorkbenchRow>
                        <AccountingWorkbenchActionRow>
                            <Text size="sm">
                                {t("detail.matchStatus")}:{" "}
                                {t(accountingMatchStatusKey(view.detail.model.facts.matchStatus))}
                            </Text>
                            <Text size="sm">
                                {t("detail.treatment")}:{" "}
                                {t(accountingTreatmentKey(view.detail.model.facts.treatment.kind))}
                            </Text>
                            <Badge tone="neutral">
                                {view.detail.model.facts.treatment.kind === "supported"
                                    ? view.detail.model.facts.treatment.code
                                    : view.detail.model.facts.treatment.reasonCode}
                            </Badge>
                        </AccountingWorkbenchActionRow>
                        <Text size="xs" tone="muted">
                            {t("detail.evidenceRefs", {
                                refs:
                                    view.detail.model.sourceEvidenceRefs.length === 0
                                        ? t("none")
                                        : view.detail.model.sourceEvidenceRefs.join(", "),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("detail.receipt", {
                                receipt: view.detail.model.receiptId ?? t("none"),
                                policy: view.detail.model.policyRevision,
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("detail.lineage", {
                                predecessor: view.detail.model.predecessorResultId ?? t("none"),
                                successor: view.detail.model.successorResultId ?? t("none"),
                            })}
                        </Text>
                    </AccountingWorkbenchFieldStack>
                ),
            )}
        </SurfaceCard>
    )
}
