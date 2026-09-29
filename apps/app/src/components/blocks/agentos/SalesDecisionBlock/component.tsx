import type { ReactNode } from "react"
import {
    Badge,
    Button,
    EmptyNotice,
    Input,
    PrimaryRailLayout,
    SectionHeader,
    SurfaceCard,
    Text,
} from "@starci/grammar/common"
import { ChoiceTabs } from "@nivo/ui"
import type { SalesDecideProposalRequest, SalesDecisionValue } from "@/modules/api/sales"
import type { useSalesDecision } from "@/hooks"
import {
    salesNoticeLive,
    salesWording,
    type SalesNotice,
    type SalesSurfaceStanding,
    type SalesTranslation,
} from "@/modules/sales/sales-workbench"
import {
    SALES_DECISION_ACTION_ROW_CLASS_NAME,
    SALES_DECISION_CLASS_NAME,
    SALES_DECISION_FIELD_STACK_CLASS_NAME,
    SALES_DECISION_FORM_FULL_SPAN_CLASS_NAME,
    SALES_DECISION_FORM_GRID_CLASS_NAME,
    SALES_DECISION_ROW_CLASS_NAME,
} from "./classNames"

/*
 * The decision surface's drawing half. It renders one settled view and resolves nothing itself: the
 * scope, the read's disclosure and the one answer's press all arrive through `props.view`, so every
 * state this file draws can be rendered from a fixture and the same file stays valid when its
 * connected owner lands beside it.
 */

/** The two answers one proposal authorizes; the control offers exactly these, in this order. */
const DECISION_ANSWERS: ReadonlyArray<SalesDecideProposalRequest["answer"]> = ["approve", "reject"]

/** One proposal status's label key; a status this build does not know stays the source's own word. */
const DECISION_STATUS_KEYS: Readonly<Record<string, string>> = {
    pending: "status.pending",
    approved: "status.approved",
    rejected: "status.rejected",
    superseded: "status.superseded",
}

/** The tone one disclosed status takes; an unknown status is neutral rather than alarming. */
const DECISION_STATUS_TONES: Readonly<Record<string, "success" | "warning" | "neutral">> = {
    pending: "warning",
    approved: "success",
    rejected: "warning",
    superseded: "neutral",
}

/** The proposal region: one read, its own selector, and the facts it disclosed. */
type ProposalRegion = {
    readonly standing: SalesSurfaceStanding
    readonly model: SalesDecisionValue | null
    readonly decisionRequestId: string
    readonly setDecisionRequestId: (value: string) => void
    readonly isLoading: boolean
    readonly reload: () => void
}

/** The answer region: one choice, its revision guard, and whether this surface may press at all. */
type AnswerRegion = {
    readonly standing: SalesSurfaceStanding
    readonly choice: SalesDecideProposalRequest["answer"]
    readonly setChoice: (choice: SalesDecideProposalRequest["answer"]) => void
    readonly expectedRevision: string
    readonly setExpectedRevision: (value: string) => void
    readonly isAnswering: boolean
    readonly addressable: boolean
    readonly stale: boolean
    readonly onSubmit: () => void
}

/** The settled view the render half draws; the connected owner resolves everything it shows. */
export type SalesDecisionBlockView = {
    readonly t: SalesTranslation
    readonly scopeWorkspace: string
    readonly scopeInstallation: string
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly notice: SalesNotice | null
    readonly proposal: ProposalRegion
    readonly answer: AnswerRegion
}

/** The settled view the drawing half receives; opaque so actions stay out of the atom check. */
type SalesDecisionBlockData = { readonly view: ReturnType<typeof useSalesDecision> }

/** The surface's outbound actions; the connected half wires them to the settled view. */
type SalesDecisionBlockActions = { readonly selectChoice: (key: string) => void }
type SalesDecisionBlockProps = { readonly props: SalesDecisionBlockData; readonly on: SalesDecisionBlockActions }
type ChildrenProps = { readonly children: ReactNode }
type NoticeProps = { readonly notice: SalesNotice | null }
type FormSubmit = { readonly preventDefault: () => void }
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly t: SalesTranslation
}

const Row = ({ children }: ChildrenProps) => (
    <div className={SALES_DECISION_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {children}
    </div>
)
const FieldStack = ({ children }: ChildrenProps) => (
    <div className={SALES_DECISION_FIELD_STACK_CLASS_NAME}>{children}</div>
)
const ActionRow = ({ children }: ChildrenProps) => (
    <div className={SALES_DECISION_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
        {children}
    </div>
)

/** One notice, announced by how it changes what the operator may do next. */
const StatusNotice = ({ notice }: NoticeProps) =>
    notice === null ? null : (
        <Text live={salesNoticeLive(notice.kind)} tone={notice.kind === "success" ? "accent" : "default"}>
            {notice.message}
        </Text>
    )

/** The one tone a disclosed status takes. */
const toneFor = (state: string): "success" | "warning" | "neutral" => DECISION_STATUS_TONES[state] ?? "neutral"

/** The answer one peer choice names; an undeclared word keeps the choice the control opened on. */
export const answerOf = (key: string): SalesDecideProposalRequest["answer"] =>
    DECISION_ANSWERS.find((answer) => answer === key) ?? "approve"

/** The rail's line about the installation address: nothing here is worded before the read answers. */
const ScopeLine = ({ scopeReady, scopeStanding, t }: ScopeLineProps) => {
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

/** Render the complete responsive decision surface from a settled controller view. */
export const SalesDecisionBlockBase = (props: SalesDecisionBlockProps) => {
    const { view } = props.props
    const { t, scopeWorkspace, scopeInstallation, scopeReady, scopeStanding, notice, proposal, answer } = view
    const model = proposal.model
    const stop = (handler: () => void) => (event: FormSubmit) => {
        event.preventDefault()
        handler()
    }
    const statusText = (status: string): string => salesWording(DECISION_STATUS_KEYS[status] ?? null, status, t)

    /* One surface's standing around the content it settled to; a refusal to read is not an empty read. */
    const region = (standing: SalesSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => {
        if (standing === "loading") return <Text isSkeleton>…</Text>
        if (standing === "denied") return <Text live="assertive">{t("refusal.forbidden")}</Text>
        if (standing === "unavailable")
            return (
                <div role="alert">
                    <EmptyNotice message={t("standing.safeToRetry")} description={t("standing.nothingChanged")} />
                </div>
            )
        if (standing === "empty") return <EmptyNotice message={empty} description={emptyHint} />
        return <>{children}</>
    }

    /* The proposal's disclosed facts, each one exactly as the read returned it. */
    const facts = (settled: SalesDecisionValue) => (
        <FieldStack>
            <ActionRow>
                <Badge tone={toneFor(settled.status)}>{statusText(settled.status)}</Badge>
                <Badge tone="neutral">{t("proposal.version", { version: settled.proposalVersion })}</Badge>
                <Badge tone="neutral">{t("proposal.revision", { revision: settled.revision })}</Badge>
            </ActionRow>
            <Row>
                <Text size="sm">
                    {t("proposal.identity", { request: settled.decisionRequestId, opportunity: settled.opportunityId })}
                </Text>
                <Text size="xs" tone="muted">
                    {t("proposal.fingerprint", { fingerprint: settled.proposalFingerprint })}
                </Text>
            </Row>
        </FieldStack>
    )

    const proposalCard = () => (
        <SurfaceCard label={t("proposal.label")} fact={model === null ? undefined : statusText(model.status)}>
            {region(
                proposal.standing,
                t("proposal.empty"),
                t("proposal.emptyHint"),
                model === null ? null : facts(model),
            )}
            <form onSubmit={stop(() => undefined)}>
                <FieldStack>
                    <Input
                        id="sales-decision-request"
                        name="sales-decision-request"
                        label={t("proposal.requestId")}
                        hint={t("proposal.requestIdHint")}
                        value={proposal.decisionRequestId}
                        onValueChange={proposal.setDecisionRequestId}
                    />
                    <ActionRow>
                        <Button
                            size="lg"
                            type="button"
                            variant="ghost"
                            isPending={proposal.isLoading}
                            onPress={proposal.reload}
                        >
                            {t("proposal.reload")}
                        </Button>
                    </ActionRow>
                </FieldStack>
            </form>
            <Text size="xs" tone="muted">
                {t("proposal.notAnEffect")}
            </Text>
        </SurfaceCard>
    )

    const answerCard = () => (
        <SurfaceCard label={t("answer.label")} fact={model === null ? undefined : statusText(model.status)}>
            <form onSubmit={stop(answer.onSubmit)}>
                <div className={SALES_DECISION_FORM_GRID_CLASS_NAME}>
                    <div className={SALES_DECISION_FORM_FULL_SPAN_CLASS_NAME}>
                        <FieldStack>
                            <Text size="sm" weight="semibold">
                                {t("answer.question")}
                            </Text>
                            <ChoiceTabs
                                props={{
                                    label: t("answer.label"),
                                    selectedKey: answer.choice,
                                    tabs: [
                                        { id: "approve", label: t("answer.approve") },
                                        { id: "reject", label: t("answer.reject") },
                                    ],
                                    variant: "primary",
                                }}
                                on={{ select: props.on.selectChoice }}
                            />
                        </FieldStack>
                    </div>
                    <Input
                        id="sales-decision-revision"
                        name="sales-decision-revision"
                        label={t("answer.expectedRevision")}
                        hint={t("answer.expectedRevisionHint")}
                        value={answer.expectedRevision}
                        onValueChange={answer.setExpectedRevision}
                        isRequired
                    />
                    <div className={SALES_DECISION_FORM_FULL_SPAN_CLASS_NAME}>
                        <FieldStack>
                            {answer.stale ? (
                                <Text size="sm" tone="accent" live="assertive">
                                    {t("answer.stale")}
                                </Text>
                            ) : null}
                            {answer.isAnswering ? (
                                <Text size="sm" tone="muted" live="polite">
                                    {t("answer.answering")}
                                </Text>
                            ) : null}
                            <ActionRow>
                                <Button
                                    size="lg"
                                    type="submit"
                                    variant="primary"
                                    isPending={answer.isAnswering}
                                    isDisabled={!scopeReady || !answer.addressable || answer.standing !== "ready"}
                                >
                                    {t("answer.submit")}
                                </Button>
                            </ActionRow>
                        </FieldStack>
                    </div>
                </div>
            </form>
            {model === null || model.status === "pending" ? (
                <Text size="xs" tone="muted">
                    {t("answer.pendingNote")}
                </Text>
            ) : (
                <Text size="sm" tone="accent">
                    {t("answer.settled")}
                </Text>
            )}
        </SurfaceCard>
    )

    const rail = () => (
        <FieldStack>
            <SurfaceCard label={t("rail.scope")}>
                <FieldStack>
                    <ScopeLine scopeReady={scopeReady} scopeStanding={scopeStanding} t={t} />
                    <Text size="xs" tone="muted">
                        {t("rail.installation", { workspace: scopeWorkspace, installation: scopeInstallation })}
                    </Text>
                </FieldStack>
            </SurfaceCard>
            <SurfaceCard label={t("rail.notice")}>
                {notice === null ? (
                    <Text size="xs" tone="muted">
                        {t("rail.noticeEmpty")}
                    </Text>
                ) : (
                    <StatusNotice notice={notice} />
                )}
            </SurfaceCard>
        </FieldStack>
    )

    const primary = () => (
        <FieldStack>
            <SectionHeader level={2} title={t("title")} description={t("description")} />
            {proposalCard()}
            {answerCard()}
        </FieldStack>
    )

    return (
        <div
            className={SALES_DECISION_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={proposal.standing === "loading" ? true : undefined}
        >
            <PrimaryRailLayout
                primary={primary()}
                rail={rail()}
                railWidth="standard"
                align="start"
                collapsedOrder="primary-first"
            />
        </div>
    )
}
