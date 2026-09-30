import { LoadingRegion } from "@/components/blocks/loading/LoadingRegion"
import type { ReactNode } from "react"
import { Badge, Button, EmptyNotice, Input, SurfaceCard, Text } from "@starci/grammar/common"
import { ChoiceTabs } from "@nivo/ui"
import type { SalesDecisionValue } from "@/modules/api/sales"
import type { useSalesDecision } from "@/hooks/agentos"
import { salesWording, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import { SALES_DECISION_FORM_FULL_SPAN_CLASS_NAME, SALES_DECISION_FORM_GRID_CLASS_NAME } from "./classNames"
import { SALES_DECISION_ACTION_ROW_CLASS_NAME, SALES_DECISION_FIELD_STACK_CLASS_NAME, SALES_DECISION_ROW_CLASS_NAME } from "./classNames"

const SALES_DECISION_STATUS_KEYS: Readonly<Record<string, string>> = {
    pending: "status.pending",
    approved: "status.approved",
    rejected: "status.rejected",
    superseded: "status.superseded",
}

const SALES_DECISION_STATUS_TONES: Readonly<Record<string, "success" | "warning" | "neutral">> = {
    pending: "warning",
    approved: "success",
    rejected: "warning",
    superseded: "neutral",
}

/** Props for a shared Sales decision card. */
type SalesDecisionCardProps = { readonly view: ReturnType<typeof useSalesDecision> }
type ChildrenProps = { readonly children: ReactNode }

/** Props for the decision's disclosed proposal card. */
export type SalesDecisionProposalCardProps = SalesDecisionCardProps

const Row = (props: ChildrenProps) => (
    <div className={SALES_DECISION_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {props.children}
    </div>
)

const FieldStack = (props: ChildrenProps) => (
    <div className={SALES_DECISION_FIELD_STACK_CLASS_NAME}>{props.children}</div>
)

const ActionRow = (props: ChildrenProps) => (
    <div className={SALES_DECISION_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
        {props.children}
    </div>
)

const statusText = (status: string, t: ReturnType<typeof useSalesDecision>["t"]): string =>
    salesWording(SALES_DECISION_STATUS_KEYS[status] ?? null, status, t)

const region = (
    standing: SalesSurfaceStanding,
    empty: string,
    emptyHint: string,
    children: ReactNode,
    t: ReturnType<typeof useSalesDecision>["t"],
) => {
    if (standing === "loading") return <LoadingRegion label={t("standing.loading")} />
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

/** Draw the proposal's disclosed identity, status, and safe reread action. */
export const SalesDecisionProposalCard = (props: SalesDecisionProposalCardProps) => {
    const { t, proposal } = props.view
    const model = proposal.model
    const facts = (settled: SalesDecisionValue) => (
        <FieldStack>
            <ActionRow>
                <Badge tone={SALES_DECISION_STATUS_TONES[settled.status] ?? "neutral"}>
                    {statusText(settled.status, t)}
                </Badge>
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

    return (
        <SurfaceCard label={t("proposal.label")} fact={model === null ? undefined : statusText(model.status, t)}>
            {region(proposal.standing, t("proposal.empty"), t("proposal.emptyHint"), model === null ? null : facts(model), t)}
            <form onSubmit={(event) => event.preventDefault()}>
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
}

/** Props for the decision's answer card and its choice action. */
export type SalesDecisionAnswerCardProps = SalesDecisionCardProps & {
    readonly selectChoice: (key: string) => void
}

/** Draw the one authorized proposal answer and its expected revision. */
export const SalesDecisionAnswerCard = (props: SalesDecisionAnswerCardProps) => {
    const { t, scopeReady, proposal, answer } = props.view
    const model = proposal.model
    return (
        <SurfaceCard label={t("answer.label")} fact={model === null ? undefined : statusText(model.status, t)}>
            <form onSubmit={(event) => {
                event.preventDefault()
                answer.onSubmit()
            }}>
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
                                on={{ select: props.selectChoice }}
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
}
