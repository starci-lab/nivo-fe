import { Text } from "@starci/grammar/common"
import type { SalesSurfaceStanding, SalesTranslation } from "@/modules/sales/sales-workbench"
import { WorkbenchRail } from "../WorkbenchRail"
import { SalesWorkbenchInstallationPolicy } from "./SalesWorkbenchInstallationPolicy"
import { SalesWorkbenchWait } from "./SalesWorkbenchWaitAndClosure"
import { SalesWorkbenchStatusNotice } from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"

/** Props for the Sales workbench scope status line. */
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly t: SalesTranslation
}

const ScopeLine = (props: ScopeLineProps) => {
    const { scopeReady, scopeStanding, t } = props
    if (scopeReady)
        return (
            <Text size="sm" tone="muted" live="polite">
                {t("rail.scopeReady")}
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
            <Text size="sm" tone="muted" live="polite">
                {t("standing.loading")}
            </Text>
        )
    return (
        <Text size="sm" tone="accent" live="assertive">
            {t(`standing.${scopeStanding}`)}
        </Text>
    )
}

type SalesWorkbenchRailProps = SalesWorkbenchSectionProps

/** Draw the Sales scope, work item, operation notice, installation, and policy rail. */
export const SalesWorkbenchRail = (props: SalesWorkbenchRailProps) => {
    const { view } = props.props
    const { t, scopeReady, scopeStanding, notice } = view
    return (
        <WorkbenchRail
            props={{
                scopeLabel: t("rail.scope"),
                scope: <ScopeLine scopeReady={scopeReady} scopeStanding={scopeStanding} t={t} />,
                beforeNotice: <SalesWorkbenchWait props={props.props} on={props.on} />,
                noticeLabel: t("rail.notice"),
                noticeEmpty: t("rail.noticeEmpty"),
                notice: <SalesWorkbenchStatusNotice notice={notice} />,
                afterNotice: <SalesWorkbenchInstallationPolicy props={props.props} on={props.on} />,
            }}
        />
    )
}
