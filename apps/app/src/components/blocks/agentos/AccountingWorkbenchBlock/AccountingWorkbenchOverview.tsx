import type { ReactNode } from "react"
import type { AccountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import { Badge, Button, Input, Select, SurfaceCard, Text } from "@starci/grammar/common"
import {
    accountingAttentionKey,
    accountingAvailabilityKey,
    accountingMeasureKey,
    accountingPartialReasonKey,
} from "@/modules/accounting/accounting-workbench"
import {
    AccountingWorkbenchActionRow,
    AccountingWorkbenchFieldStack,
    AccountingWorkbenchMeasureValue,
    AccountingWorkbenchRow,
} from "./accounting-workbench.shared"
import { accountingMeasureBand } from "./accounting-workbench.helpers"
import { ACCOUNTING_SUMMARY_GRID_CLASS_NAME } from "./classNames"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchRegion } from "./accounting-workbench.shared"

/** Props for the overview accounting workbench unit. */
type AccountingWorkbenchOverviewProps = { readonly props: AccountingWorkbenchSectionData }

/** Draw the overview accounting workbench section from settled view data. */
export const AccountingWorkbenchOverview = (props: AccountingWorkbenchOverviewProps) => {
    const { view, shared, scopeReady } = props.props
    const { t, currency, setCurrency, periodMonth, setPeriodMonth } = view
    const amount = view.format.amount
    const estimateCurrency = view.overview.model?.currency ?? null

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
            label={t("overview.label")}
            fact={t("overview.covered", { count: view.overview.model?.items.length ?? 0 })}
        >
            <div className={ACCOUNTING_SUMMARY_GRID_CLASS_NAME}>
                <AccountingWorkbenchFieldStack>
                    <Input
                        id="accounting-period"
                        name="accounting-period"
                        label={t("overview.period")}
                        kind="text"
                        value={periodMonth}
                        onValueChange={setPeriodMonth}
                    />
                    <Select
                        name="accounting-currency"
                        label={t("overview.currency")}
                        options={[
                            { id: "", label: t("overview.allCurrencies") },
                            ...[
                                ...new Set(
                                    (view.overview.model?.items ?? []).flatMap((item) =>
                                        item.currency === null ? [] : [item.currency],
                                    ),
                                ),
                            ].map((code) => ({ id: code, label: code })),
                        ]}
                        value={currency ?? ""}
                        onValueChange={(value) => setCurrency(value === null || value.length === 0 ? null : value)}
                    />
                    <AccountingWorkbenchActionRow>
                        {view.overview.model === null ? null : (
                            <Badge tone={view.overview.model.partialReasons.length > 0 ? "warning" : "success"}>
                                {t("overview.availability", {
                                    value: t(
                                        accountingAvailabilityKey(
                                            view.overview.model.partialReasons.length === 0 ? "current" : "partial",
                                        ),
                                    ),
                                })}
                            </Badge>
                        )}
                        <Badge tone="neutral">
                            {t("overview.periodBadge", { period: view.format.period(view.periodLabel) })}
                        </Badge>
                        <Badge tone="neutral">
                            {t("overview.itemCount", { count: view.overview.model?.items.length ?? 0 })}
                        </Badge>
                    </AccountingWorkbenchActionRow>
                    {view.overview.attention.length === 0 ? null : (
                        <Text size="sm" tone="accent" live="polite">
                            {t("overview.attention", {
                                codes: view.overview.attention
                                    .map((code) =>
                                        accountingAttentionKey(code) === "attention.other"
                                            ? code
                                            : t(accountingAttentionKey(code)),
                                    )
                                    .join(", "),
                            })}
                        </Text>
                    )}
                    {view.overview.model === null ? null : (
                        <Text size="xs" tone="muted">
                            {t("overview.sourceCoverage", {
                                count: new Set(view.overview.model.items.flatMap((item) => item.sourceEvidenceRefs))
                                    .size,
                            })}
                        </Text>
                    )}
                    {view.overview.model === null || view.overview.model.partialReasons.length === 0 ? null : (
                        <Text size="xs" tone="muted">
                            {t("overview.partial", {
                                reasons: view.overview.model.partialReasons
                                    .map((reason) => t(accountingPartialReasonKey(reason)))
                                    .join(", "),
                            })}
                        </Text>
                    )}
                    {view.overview.nextCursor === null ? null : (
                        <Button
                            size="lg"
                            variant="secondary"
                            isPending={view.overview.isFetching}
                            onPress={view.overview.loadMore}
                        >
                            {shared.loadMore}
                        </Button>
                    )}
                </AccountingWorkbenchFieldStack>
                <AccountingWorkbenchFieldStack>
                    {region(
                        view.overview.standing,
                        t("overview.empty"),
                        t("overview.emptyHint"),
                        <>
                            {[
                                "cash-in",
                                "cash-out",
                                "recognized-revenue",
                                "recognized-cost",
                                "unpaid",
                                "estimated-tax",
                            ].map((kind) => {
                                const band = accountingMeasureBand(view.overview.model?.items ?? [], kind)
                                return (
                                    <AccountingWorkbenchRow key={kind}>
                                        <Text size="sm" weight="semibold">
                                            {t(accountingMeasureKey(kind))}
                                        </Text>
                                        <AccountingWorkbenchMeasureValue band={band} amount={amount} t={t} />
                                    </AccountingWorkbenchRow>
                                )
                            })}
                            {estimateCurrency === null ? null : (
                                <Text size="xs" tone="muted">
                                    {t("overview.estimate", { currency: estimateCurrency })}
                                </Text>
                            )}
                        </>,
                    )}
                </AccountingWorkbenchFieldStack>
            </div>
        </SurfaceCard>
    )
}
