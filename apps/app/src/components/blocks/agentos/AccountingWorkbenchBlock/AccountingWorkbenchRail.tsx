import { Button, EmptyNotice, Input, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common"
import type { AccountingSurfaceStanding, AccountingTranslation } from "@/modules/accounting/accounting-workbench"
import { accountingAttentionKey } from "@/modules/accounting/accounting-workbench"
import { WorkbenchRail } from "../WorkbenchRail"
import {
    AccountingWorkbenchActionRow,
    AccountingWorkbenchFieldStack,
    AccountingWorkbenchRow,
    AccountingWorkbenchStatusNotice,
} from "./accounting-workbench.shared"
import type { AccountingWorkbenchBlockData } from "./accounting-workbench.types"

/** Props for the accounting workbench's shared scope, notice, and attention rail. */
type AccountingWorkbenchRailProps = { readonly props: AccountingWorkbenchBlockData }

type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: AccountingSurfaceStanding
    readonly t: AccountingTranslation
}

const ScopeLine = (props: ScopeLineProps) => {
    const { scopeReady, scopeStanding, t } = props
    if (scopeReady)
        return (
            <Text size="sm" tone="muted" live="polite">
                {t("standing.ready")}
            </Text>
        )
    if (scopeStanding === "denied")
        return (
            <Text size="sm" tone="accent" live="assertive">
                {t("refusal.forbidden")}
            </Text>
        )
    if (scopeStanding === "loading")
        return (
            <Text size="sm" tone="muted">
                {t("standing.loading")}
            </Text>
        )
    return (
        <Text size="sm" tone="accent" live="assertive">
            {t("standing." + scopeStanding)}
        </Text>
    )
}

/** Draw the shared accounting scope, attention, as-of, and notice rail. */
export const AccountingWorkbenchRail = (props: AccountingWorkbenchRailProps) => {
    const { view } = props.props
    const {
        t,
        scopeReady,
        scopeStanding,
        notice,
        asOf,
        asOfDraft,
        setAsOf,
        setAsOfDraft,
    } = view
    return (
        <WorkbenchRail
            props={{
                scopeLabel: t("rail.scope"),
                scope: <ScopeLine scopeReady={scopeReady} scopeStanding={scopeStanding} t={t} />,
                beforeNotice: (
                    <>
                        <SurfaceListCard
                            label={t("rail.attention")}
                            fact={t("overview.itemCount", { count: view.overview.attention.length })}
                            isLoading={view.overview.standing === "loading"}
                        >
                            {view.overview.attention.length === 0 ? (
                                <EmptyNotice
                                    message={t("rail.attentionEmpty")}
                                    description={t("rail.attentionEmptyHint")}
                                />
                            ) : (
                                view.overview.attention.map((code) => (
                                    <AccountingWorkbenchRow key={code}>
                                        <Text size="sm">
                                            {accountingAttentionKey(code) === "attention.other"
                                                ? code
                                                : t(accountingAttentionKey(code))}
                                        </Text>
                                    </AccountingWorkbenchRow>
                                ))
                            )}
                        </SurfaceListCard>
                        <SurfaceCard label={t("rail.asOf")}>
                            <AccountingWorkbenchFieldStack>
                                <Input
                                    id="accounting-asof-draft"
                                    name="accounting-asof-draft"
                                    label={t("rail.asOfValue")}
                                    hint={t("rail.asOfHint")}
                                    value={asOfDraft}
                                    onValueChange={setAsOfDraft}
                                />
                                <AccountingWorkbenchActionRow>
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        isDisabled={asOfDraft.length === 0}
                                        onPress={() => setAsOf(asOfDraft)}
                                    >
                                        {t("rail.asOfApply")}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        isDisabled={asOf === null}
                                        onPress={() => {
                                            setAsOf(null)
                                            setAsOfDraft("")
                                        }}
                                    >
                                        {t("rail.returnCurrent")}
                                    </Button>
                                </AccountingWorkbenchActionRow>
                                {asOf === null ? (
                                    <Text size="xs" tone="muted">
                                        {t("rail.current")}
                                    </Text>
                                ) : (
                                    <Text size="xs" tone="accent" live="polite">
                                        {t("rail.historical")}
                                    </Text>
                                )}
                            </AccountingWorkbenchFieldStack>
                        </SurfaceCard>
                    </>
                ),
                noticeLabel: t("rail.notice"),
                noticeEmpty: t("rail.noticeEmpty"),
                notice: notice === null ? null : <AccountingWorkbenchStatusNotice notice={notice} />,
            }}
        />
    )
}
