import type { ReactNode } from "react"
import { LoadingRegion } from "@/components/blocks/loading/LoadingRegion"
import { EmptyNotice, Heading, Text } from "@starci/grammar/common"
import type { AccountingSurfaceStanding, AccountingTranslation, AccountingNotice } from "@/modules/accounting/accounting-workbench"
import { ACCOUNTING_FIELD_STACK_CLASS_NAME, ACCOUNTING_ROW_CLASS_NAME, ACCOUNTING_ACTION_ROW_CLASS_NAME } from "./classNames"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import type { AccountingMeasureBandReading } from "./accounting-workbench.helpers"

/** Props for the accounting workbench row layout unit. */
export type AccountingWorkbenchRowProps = { readonly children: ReactNode }

/** Draw one shared accounting workbench row. */
export const AccountingWorkbenchRow = (props: AccountingWorkbenchRowProps) => (
    <div className={ACCOUNTING_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {props.children}
    </div>
)

/** Props for the accounting workbench field stack unit. */
export type AccountingWorkbenchFieldStackProps = { readonly children: ReactNode }

/** Draw one shared accounting workbench field stack. */
export const AccountingWorkbenchFieldStack = (props: AccountingWorkbenchFieldStackProps) => (
    <div className={ACCOUNTING_FIELD_STACK_CLASS_NAME}>{props.children}</div>
)

/** Props for the accounting workbench action row unit. */
export type AccountingWorkbenchActionRowProps = { readonly children: ReactNode }

/** Draw one shared accounting workbench action row. */
export const AccountingWorkbenchActionRow = (props: AccountingWorkbenchActionRowProps) => (
    <div className={ACCOUNTING_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
        {props.children}
    </div>
)

/** Props for one accounting section's explicit loading, refusal, empty, or settled state. */
export type AccountingWorkbenchRegionProps = {
    readonly props: AccountingWorkbenchSectionData & {
        readonly standing: AccountingSurfaceStanding
        readonly empty: string
        readonly emptyHint: string
    }
    readonly children: ReactNode
}

/** Keep a surface's standing around the content it settled to. */
export const AccountingWorkbenchRegion = (props: AccountingWorkbenchRegionProps) => {
    const { view, shared, standing, empty, emptyHint } = props.props
    const { t } = view
    if (standing === "loading") return <LoadingRegion label={t("standing.loading")} />
    if (standing === "denied") return <Text live="assertive">{t("refusal.forbidden")}</Text>
    if (standing === "unavailable")
        return (
            <div role="alert">
                <EmptyNotice message={shared.surfaceUnavailable} description={t("nothingChanged")} />
            </div>
        )
    if (standing === "empty") return <EmptyNotice message={empty} description={emptyHint} />
    return <>{props.children}</>
}

/** Props for the status notice shown in the accounting rail. */
export type AccountingWorkbenchStatusNoticeProps = { readonly notice: AccountingNotice | null }

/** Draw the notice kind with its settled accessibility announcement mode. */
export const AccountingWorkbenchStatusNotice = (props: AccountingWorkbenchStatusNoticeProps) =>
    props.notice === null ? null : (
        <Text size="sm" tone={props.notice.kind === "refused" ? "accent" : "muted"} live={props.notice.live}>
            {props.notice.message}
        </Text>
    )

/** Props for the accounting measure band value unit. */
export type AccountingWorkbenchMeasureValueProps = {
    readonly band: AccountingMeasureBandReading
    readonly amount: (minor: number, currency: string) => string
    readonly t: AccountingTranslation
}

/** Draw a settled amount, or state why the period measure is partial. */
export const AccountingWorkbenchMeasureValue = (props: AccountingWorkbenchMeasureValueProps) => {
    const { band, amount, t } = props
    if (band === null)
        return (
            <Text size="sm" tone="muted">
                {t("overview.noMeasures")}
            </Text>
        )
    if ("reasonCode" in band)
        return (
            <Text size="sm" tone="muted">
                {t("overview.measureUnknown", { reason: band.reasonCode })}
            </Text>
        )
    return (
        <div>
            <Heading level={3}>{amount(band.amountMinor, band.currency)}</Heading>
            <Text size="xs" tone="muted">
                {t("overview.covered", { count: band.covered })}
            </Text>
        </div>
    )
}
