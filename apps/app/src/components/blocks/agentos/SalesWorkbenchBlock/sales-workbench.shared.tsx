import type { ReactNode } from "react"
import { LoadingRegion } from "@/components/blocks/loading/LoadingRegion"
import { EmptyNotice, Text } from "@starci/grammar/common"
import { salesNoticeLive, type SalesNotice, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import { SALES_ACTION_ROW_CLASS_NAME, SALES_FIELD_STACK_CLASS_NAME, SALES_ROW_CLASS_NAME } from "./classNames"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"

/** Props for a shared Sales workbench row. */
export type SalesWorkbenchRowProps = { readonly children: ReactNode }

/** Draw one shared Sales workbench row. */
export const SalesWorkbenchRow = (props: SalesWorkbenchRowProps) => (
    <div className={SALES_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {props.children}
    </div>
)

/** Props for a shared Sales workbench field stack. */
export type SalesWorkbenchFieldStackProps = { readonly children: ReactNode }

/** Draw one shared Sales workbench field stack. */
export const SalesWorkbenchFieldStack = (props: SalesWorkbenchFieldStackProps) => (
    <div className={SALES_FIELD_STACK_CLASS_NAME}>{props.children}</div>
)

/** Props for a shared Sales workbench action row. */
export type SalesWorkbenchActionRowProps = { readonly children: ReactNode }

/** Draw one shared Sales workbench action row. */
export const SalesWorkbenchActionRow = (props: SalesWorkbenchActionRowProps) => (
    <div className={SALES_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
        {props.children}
    </div>
)

/** Props for a Sales section's explicit loading, refusal, empty, or settled state. */
export type SalesWorkbenchRegionProps = {
    readonly props: SalesWorkbenchSectionProps["props"] & {
        readonly standing: SalesSurfaceStanding
        readonly empty: string
        readonly emptyHint: string
    }
    readonly children: ReactNode
}

/** Keep a Sales surface's explicit standing around the content it settled to. */
export const SalesWorkbenchRegion = (props: SalesWorkbenchRegionProps) => {
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

/** Props for the latest Sales operation notice. */
export type SalesWorkbenchStatusNoticeProps = { readonly notice: SalesNotice | null }

/** Draw one Sales notice with its own live-region mode and semantic tone. */
export const SalesWorkbenchStatusNotice = (props: SalesWorkbenchStatusNoticeProps) =>
    props.notice === null ? null : (
        <Text live={salesNoticeLive(props.notice.kind)} tone={props.notice.kind === "success" ? "accent" : "default"}>
            {props.notice.message}
        </Text>
    )
