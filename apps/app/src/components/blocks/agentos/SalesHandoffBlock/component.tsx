import type { ReactNode } from "react"
import { PrimaryRailLayout, SectionHeader, Text } from "@starci/grammar/common"
import type { SalesSurfaceStanding, SalesTranslation, SalesNotice } from "@/modules/sales/sales-workbench"
import { salesNoticeLive } from "@/modules/sales/sales-workbench"
import { WorkbenchRail } from "../WorkbenchRail"
import { SalesHandoffReadbackCard, SalesHandoffSubmissionCard, type SalesHandoffView } from "./SalesHandoffCards"
import { SALES_HANDOFF_CLASS_NAME, SALES_HANDOFF_FIELD_STACK_CLASS_NAME } from "./classNames"

/** The settled view the drawing half receives. */
type SalesHandoffBlockData = { readonly view: SalesHandoffView }
type SalesHandoffBlockProps = { readonly props: SalesHandoffBlockData }
type NoticeProps = { readonly notice: SalesNotice | null }
type FieldStackProps = { readonly children: ReactNode }
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly t: SalesTranslation
}

const FieldStack = (props: FieldStackProps) => (
    <div className={SALES_HANDOFF_FIELD_STACK_CLASS_NAME}>{props.children}</div>
)

/** One notice, announced by how it changes what the operator may do next. */
const StatusNotice = (props: NoticeProps) =>
    props.notice === null ? null : (
        <Text live={salesNoticeLive(props.notice.kind)} tone={props.notice.kind === "success" ? "accent" : "default"}>
            {props.notice.message}
        </Text>
    )

/** The rail's line about the installation address: nothing here is worded before the read answers. */
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
            {t("standing.safeToRetry")}
        </Text>
    )
}

/** Compose the connected handoff surface from its readback, submission, and scope units. */
export const SalesHandoffBlockBase = (props: SalesHandoffBlockProps) => {
    const { view } = props.props
    const { t, scopeWorkspace, scopeInstallation, scopeReady, scopeStanding, notice } = view
    const primary = (
        <FieldStack>
            <SectionHeader level={2} title={t("title")} description={t("description")} />
            <SalesHandoffReadbackCard view={view} />
            <SalesHandoffSubmissionCard view={view} />
        </FieldStack>
    )
    const rail = (
        <WorkbenchRail
            props={{
                scopeLabel: t("rail.scope"),
                scope: (
                    <FieldStack>
                        <ScopeLine scopeReady={scopeReady} scopeStanding={scopeStanding} t={t} />
                        <Text size="xs" tone="muted">
                            {t("rail.installation", { workspace: scopeWorkspace, installation: scopeInstallation })}
                        </Text>
                    </FieldStack>
                ),
                noticeLabel: t("rail.notice"),
                noticeEmpty: t("rail.noticeEmpty"),
                notice: notice === null ? null : <StatusNotice notice={notice} />,
            }}
        />
    )

    return (
        <div
            className={SALES_HANDOFF_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={view.handoff.standing === "loading" ? true : undefined}
        >
            <PrimaryRailLayout
                primary={primary}
                rail={rail}
                railWidth="standard"
                align="start"
                collapsedOrder="primary-first"
            />
        </div>
    )
}
