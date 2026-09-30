import type { ReactNode } from "react"
import { PrimaryRailLayout, SectionHeader, Text } from "@starci/grammar/common"
import type { SalesDecideProposalRequest } from "@/modules/api/sales"
import type { useSalesDecision } from "@/hooks/agentos"
import { salesNoticeLive, type SalesNotice, type SalesSurfaceStanding, type SalesTranslation } from "@/modules/sales/sales-workbench"
import { WorkbenchRail } from "../WorkbenchRail"
import { SalesDecisionAnswerCard, SalesDecisionProposalCard } from "./SalesDecisionCards"
import { SALES_DECISION_CLASS_NAME, SALES_DECISION_FIELD_STACK_CLASS_NAME } from "./classNames"

/** The settled view the drawing half receives; opaque so actions stay out of the atom check. */
type SalesDecisionBlockData = { readonly view: ReturnType<typeof useSalesDecision> }

/** The surface's outbound answer action; the connected half wires it to the settled view. */
type SalesDecisionBlockActions = { readonly selectChoice: (key: string) => void }
type SalesDecisionBlockProps = { readonly props: SalesDecisionBlockData; readonly on: SalesDecisionBlockActions }
type FieldStackProps = { readonly children: ReactNode }
type NoticeProps = { readonly notice: SalesNotice | null }
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly t: SalesTranslation
}

const FieldStack = (props: FieldStackProps) => (
    <div className={SALES_DECISION_FIELD_STACK_CLASS_NAME}>{props.children}</div>
)

/** One notice, announced by how it changes what the operator may do next. */
const StatusNotice = (props: NoticeProps) =>
    props.notice === null ? null : (
        <Text live={salesNoticeLive(props.notice.kind)} tone={props.notice.kind === "success" ? "accent" : "default"}>
            {props.notice.message}
        </Text>
    )

/** The answer one peer choice names; an undeclared word keeps the choice the control opened on. */
export const answerOf = (key: string): SalesDecideProposalRequest["answer"] =>
    key === "reject" ? "reject" : "approve"

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

/** Compose the connected decision surface from its proposal, answer, and scope units. */
export const SalesDecisionBlockBase = (props: SalesDecisionBlockProps) => {
    const { view } = props.props
    const { t, scopeWorkspace, scopeInstallation, scopeReady, scopeStanding, notice } = view
    const primary = (
        <FieldStack>
            <SectionHeader level={2} title={t("title")} description={t("description")} />
            <SalesDecisionProposalCard view={view} />
            <SalesDecisionAnswerCard view={view} selectChoice={props.on.selectChoice} />
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
            className={SALES_DECISION_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={view.proposal.standing === "loading" ? true : undefined}
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
