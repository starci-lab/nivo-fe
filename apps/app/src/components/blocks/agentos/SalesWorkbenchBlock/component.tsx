import type { ReactNode } from "react"
import {
    Badge,
    Button,
    EmptyNotice,
    Input,
    PrimaryRailLayout,
    Select,
    SectionHeader,
    SurfaceCard,
    SurfaceListCard,
    Text,
} from "@starci/grammar/common"
import type { SalesActionValue, SalesCloseRequest, SalesPipelineItem } from "@/modules/api/sales"
import type { useSalesWorkbench } from "@/hooks"
import type { Formatter } from "@/modules/i18n/formatter"
import {
    formatSalesInstant,
    salesActionStatusKey,
    salesClarificationFactKey,
    salesCommandStatusKey,
    salesLifecycleKey,
    salesNoticeLive,
    salesOutcomeKey,
    salesWorkReasonKey,
    salesWorkStateKey,
    salesWording,
    type SalesNotice,
    type SalesSurfaceStanding,
    type SalesTranslation,
} from "@/modules/sales/sales-workbench"
import {
    SALES_ACTION_ROW_CLASS_NAME,
    SALES_FIELD_STACK_CLASS_NAME,
    SALES_FORM_FULL_SPAN_CLASS_NAME,
    SALES_FORM_GRID_CLASS_NAME,
    SALES_OPERATIONS_GRID_CLASS_NAME,
    SALES_ROW_CLASS_NAME,
    SALES_WORKBENCH_CLASS_NAME,
} from "./classNames"

/** The settled view the render half draws; the connected owner resolves everything it shows. */
type SalesWorkbenchBlockData = { readonly view: ReturnType<typeof useSalesWorkbench>; readonly format: Formatter }
/** The view's three direct-call mutations; every other member crosses as a value prop. */
type SalesWorkbenchBlockActions = {
    readonly selectOpportunity: (opportunityId: string) => void
    readonly setFactKind: (kind: "customerRef" | "opportunityId") => void
    readonly setOutcome: (outcome: SalesCloseRequest["outcome"]) => void
}
type SalesWorkbenchBlockProps = { readonly props: SalesWorkbenchBlockData; readonly on: SalesWorkbenchBlockActions }
type ChildrenProps = { readonly children: ReactNode }
type StatusNoticeProps = { readonly notice: SalesNotice | null }
type FormSubmit = { readonly preventDefault: () => void }
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly t: SalesTranslation
}

const Row = ({ children }: ChildrenProps) => (
    <div className={SALES_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {children}
    </div>
)
const FieldStack = ({ children }: ChildrenProps) => <div className={SALES_FIELD_STACK_CLASS_NAME}>{children}</div>
const ActionRow = ({ children }: ChildrenProps) => (
    <div className={SALES_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
        {children}
    </div>
)

const StatusNotice = ({ notice }: StatusNoticeProps) =>
    notice === null ? null : (
        <Text live={salesNoticeLive(notice.kind)} tone={notice.kind === "success" ? "accent" : "default"}>
            {notice.message}
        </Text>
    )

type BadgeTone = "success" | "warning" | "neutral"
/** The tone one closed state's badge takes; a state this build does not know is neutral. */
const toneFor = (tones: Readonly<Record<string, BadgeTone>>, state: string): BadgeTone => tones[state] ?? "neutral"
const WORK_STATE_TONES: Readonly<Record<string, BadgeTone>> = {
    ready: "success",
    waiting: "neutral",
    attention: "warning",
}
const COMMAND_TONES: Readonly<Record<string, BadgeTone>> = {
    accepted: "success",
    "awaiting-clarification": "warning",
    rejected: "warning",
    withdrawn: "neutral",
}
const ACTION_TONES: Readonly<Record<string, BadgeTone>> = {
    delivered: "success",
    stopped: "warning",
    "outcome-unknown": "warning",
}
const LIFECYCLE_TONES: Readonly<Record<string, BadgeTone>> = { open: "neutral", won: "success", lost: "warning" }
/** The closed closure-outcome vocabulary, in the order the closure control offers it. */
const CLOSE_OUTCOMES: ReadonlyArray<SalesCloseRequest["outcome"]> = ["won", "lost", "attention"]
/** The outcome one control value selects; an undeclared value keeps the outcome the control opened on. */
const closeOutcomeOf = (value: string): SalesCloseRequest["outcome"] =>
    CLOSE_OUTCOMES.find((outcome) => outcome === value) ?? "won"

/** The rail's installation line: one sentence per scope standing. */
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
            {t(`standing.${scopeStanding}`)}
        </Text>
    )
}

/** Render the complete responsive Sales workbench from a settled controller view. */
export const SalesWorkbenchBlockBase = (props: SalesWorkbenchBlockProps) => {
    const { view, format } = props.props
    const { selectOpportunity, setFactKind, setOutcome } = props.on
    const { t, scopeReady, scopeStanding, notice } = view
    const stop = (handler: () => void) => (event: FormSubmit) => {
        event.preventDefault()
        handler()
    }
    const workStateText = (workState: string): string => salesWording(salesWorkStateKey(workState), workState, t)
    const reasonText = (reason: string | null): string =>
        reason === null || reason.length === 0 ? t("none") : salesWording(salesWorkReasonKey(reason), reason, t)
    const lifecycleText = (status: string): string => salesWording(salesLifecycleKey(status), status, t)
    const actionText = (status: string): string => salesWording(salesActionStatusKey(status), status, t)

    /* One surface's standing around the content it settled to; a refusal to read is not an empty read. */
    const region = (standing: SalesSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => {
        if (standing === "loading") return <Text isSkeleton>…</Text>
        if (standing === "denied") return <Text live="assertive">{t("refusal.forbidden")}</Text>
        if (standing === "unavailable")
            return (
                <div role="alert">
                    <EmptyNotice message={t("surfaceUnavailable")} description={t("nothingChanged")} />
                </div>
            )
        if (standing === "empty") return <EmptyNotice message={empty} description={emptyHint} />
        return <>{children}</>
    }

    const attentionRow = (row: SalesPipelineItem) => (
        <Row key={row.opportunityId}>
            <ActionRow>
                <Button
                    size="lg"
                    variant="ghost"
                    isDisabled={!scopeReady}
                    onPress={() => selectOpportunity(row.opportunityId)}
                >
                    {row.customerRef}
                </Button>
                <Badge tone={toneFor(WORK_STATE_TONES, row.workState)}>{workStateText(row.workState)}</Badge>
                <Badge tone={toneFor(LIFECYCLE_TONES, row.status)}>{lifecycleText(row.status)}</Badge>
            </ActionRow>
            <Text size="sm">{row.purpose}</Text>
            <Text size="xs" tone="muted">
                {t("revision", { value: row.revision })}
            </Text>
        </Row>
    )

    const commandBand = () => (
        <SurfaceCard label={t("command.label")} fact={t("attention.covered", { count: view.attention.total })}>
            <form onSubmit={stop(view.command.onSubmit)}>
                <div className={SALES_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="sales-command-id"
                        name="sales-command-id"
                        label={t("command.commandId")}
                        hint={t("command.commandIdHint")}
                        value={view.command.commandId}
                        onValueChange={view.command.setCommandId}
                        isRequired
                    />
                    <Input
                        id="sales-command-outcome"
                        name="sales-command-outcome"
                        label={t("command.outcome")}
                        hint={t("command.outcomeHint")}
                        value={view.command.requestedActions}
                        onValueChange={view.command.setRequestedActions}
                        isRequired
                    />
                    <Input
                        id="sales-command-revision"
                        name="sales-command-revision"
                        label={t("command.revision")}
                        value={view.command.commandRevision}
                        onValueChange={view.command.setCommandRevision}
                        isRequired
                    />
                    <Input
                        id="sales-command-customer-refs"
                        name="sales-command-customer-refs"
                        label={t("command.customerRefs")}
                        hint={t("command.identityHint")}
                        value={view.command.customerRefs}
                        onValueChange={view.command.setCustomerRefs}
                    />
                    <Input
                        id="sales-command-opportunity-ids"
                        name="sales-command-opportunity-ids"
                        label={t("command.opportunityIds")}
                        hint={t("command.identityHint")}
                        value={view.command.opportunityIds}
                        onValueChange={view.command.setOpportunityIds}
                    />
                    <Input
                        id="sales-command-offer-refs"
                        name="sales-command-offer-refs"
                        label={t("command.offerRefs")}
                        hint={t("command.identityHint")}
                        value={view.command.offerRefs}
                        onValueChange={view.command.setOfferRefs}
                    />
                    <Input
                        id="sales-command-fingerprint"
                        name="sales-command-fingerprint"
                        label={t("command.fingerprint")}
                        hint={t("command.fingerprintHint")}
                        value={view.command.fingerprint}
                        onValueChange={view.command.setFingerprint}
                        isRequired
                    />
                    <Input
                        id="sales-command-guards"
                        name="sales-command-guards"
                        label={t("command.guards")}
                        hint={t("command.guardsHint")}
                        value={view.command.expectedRevisions}
                        onValueChange={view.command.setExpectedRevisions}
                    />
                    <div className={SALES_FORM_FULL_SPAN_CLASS_NAME}>
                        <ActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.command.isSubmitting}
                                isDisabled={!scopeReady || !view.command.addressable}
                            >
                                {t("command.submit")}
                            </Button>
                        </ActionRow>
                        {view.command.actions.length === 0 ? null : (
                            <Text size="xs" tone="muted">
                                {t("command.acceptedActions", { actions: view.command.actions.join(", ") })}
                            </Text>
                        )}
                    </div>
                </div>
            </form>
        </SurfaceCard>
    )

    const attention = () => (
        <SurfaceListCard
            label={t("attention.list")}
            fact={t("attention.covered", { count: view.attention.rows.length })}
            isLoading={view.attention.standing === "loading"}
        >
            {region(
                view.attention.standing,
                t("attention.empty"),
                t("attention.emptyHint"),
                <FieldStack>
                    {view.attention.rows.map(attentionRow)}
                    {view.attention.observedAt === null ? null : (
                        <Text size="xs" tone="muted">
                            {t("attention.observedAt", { at: formatSalesInstant(view.attention.observedAt, format) })}
                        </Text>
                    )}
                    {view.attention.nextAfter === null ? null : (
                        <Button
                            size="lg"
                            variant="secondary"
                            isPending={view.attention.isLoading}
                            onPress={view.attention.loadMore}
                        >
                            {t("attention.loadMore")}
                        </Button>
                    )}
                </FieldStack>,
            )}
            <ActionRow>
                <Button size="lg" variant="ghost" onPress={view.attention.retry}>
                    {t("reload")}
                </Button>
            </ActionRow>
        </SurfaceListCard>
    )

    const history = () => (
        <SurfaceCard
            label={t("history.label")}
            fact={
                view.history.model === null
                    ? undefined
                    : salesWording(salesCommandStatusKey(view.history.model.status), view.history.model.status, t)
            }
        >
            <ActionRow>
                <Button size="lg" variant="ghost" onPress={view.history.retry}>
                    {t("reload")}
                </Button>
            </ActionRow>
            {region(
                view.history.standing,
                t("history.empty"),
                t("history.emptyHint"),
                view.history.model === null ? null : (
                    <FieldStack>
                        <ActionRow>
                            <Text weight="semibold">{view.history.model.commandId}</Text>
                            <Badge tone={toneFor(COMMAND_TONES, view.history.model.status)}>
                                {salesWording(
                                    salesCommandStatusKey(view.history.model.status),
                                    view.history.model.status,
                                    t,
                                )}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.history.model.revision })}</Badge>
                            <Badge tone="neutral">
                                {t("history.commandRevision", { value: view.history.model.commandRevision })}
                            </Badge>
                        </ActionRow>
                        <Text size="sm">
                            {t("history.actions", {
                                actions:
                                    view.history.model.actionIds.length === 0
                                        ? t("none")
                                        : view.history.model.actionIds.join(", "),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("history.clarification", {
                                clarification:
                                    view.history.model.clarification === null
                                        ? t("none")
                                        : JSON.stringify(view.history.model.clarification),
                            })}
                        </Text>
                    </FieldStack>
                ),
            )}
        </SurfaceCard>
    )

    const ambiguity = () => (
        <SurfaceCard label={t("ambiguity.label")}>
            <form onSubmit={stop(view.ambiguity.onClarify)}>
                <FieldStack>
                    <Text size="sm" weight="semibold">
                        {t("ambiguity.question")}
                    </Text>
                    <Text size="sm">
                        {view.ambiguity.clarification === null
                            ? t("ambiguity.noQuestion")
                            : JSON.stringify(view.ambiguity.clarification)}
                    </Text>
                    <Select
                        name="sales-fact-kind"
                        label={t("ambiguity.fact")}
                        options={[
                            { id: "opportunityId", label: t(salesClarificationFactKey({ opportunityId: "x" })) },
                            { id: "customerRef", label: t(salesClarificationFactKey({ customerRef: "x" })) },
                        ]}
                        value={view.ambiguity.factKind}
                        onValueChange={(value) =>
                            setFactKind(value === "customerRef" ? "customerRef" : "opportunityId")
                        }
                    />
                    <Input
                        id="sales-fact-value"
                        name="sales-fact-value"
                        label={t("ambiguity.factValue")}
                        hint={t("ambiguity.factValueHint")}
                        value={view.ambiguity.factValue}
                        onValueChange={view.ambiguity.setFactValue}
                        isRequired
                    />
                    <Input
                        id="sales-clarification-revision"
                        name="sales-clarification-revision"
                        label={t("ambiguity.revision")}
                        hint={t("ambiguity.revisionHint")}
                        value={view.ambiguity.revision}
                        onValueChange={view.ambiguity.setRevision}
                        isRequired
                    />
                    <ActionRow>
                        <Button
                            size="lg"
                            type="submit"
                            variant="primary"
                            isPending={view.ambiguity.isClarifying}
                            isDisabled={!scopeReady || !view.ambiguity.addressable}
                        >
                            {t("ambiguity.answer")}
                        </Button>
                    </ActionRow>
                </FieldStack>
            </form>
            {view.ambiguity.standing === "loading" ? null : (
                <Text size="xs" tone="muted">
                    {t("ambiguity.pendingNote")}
                </Text>
            )}
        </SurfaceCard>
    )

    const actionFacts = (model: SalesActionValue) => (
        <FieldStack>
            <ActionRow>
                <Badge tone={toneFor(ACTION_TONES, model.status)}>{actionText(model.status)}</Badge>
                <Badge tone="neutral">{t("revision", { value: model.revision })}</Badge>
                <Badge tone="neutral">{t("routine.attempt", { value: model.attemptGeneration })}</Badge>
            </ActionRow>
            <Text size="xs" tone="muted">
                {t("routine.receipt", {
                    receipt: model.receiverReceipt === null ? t("none") : JSON.stringify(model.receiverReceipt),
                })}
            </Text>
            {model.observationGap ? (
                <Text size="sm" tone="accent" live="polite">
                    {t("routine.gap")}
                </Text>
            ) : null}
        </FieldStack>
    )

    const routine = () => (
        <SurfaceCard
            label={t("routine.label")}
            fact={view.routine.model === null ? undefined : actionText(view.routine.model.status)}
        >
            {region(
                view.routine.standing,
                t("routine.empty"),
                t("routine.emptyHint"),
                view.routine.model === null ? null : actionFacts(view.routine.model),
            )}
            <ActionRow>
                <Button size="lg" variant="ghost" onPress={view.routine.reload}>
                    {t("reload")}
                </Button>
            </ActionRow>
        </SurfaceCard>
    )

    const recovery = () => (
        <SurfaceCard
            label={t("recovery.label")}
            fact={
                view.routine.door === "hold"
                    ? t("recovery.hold")
                    : t("recovery.door", { door: t(`recovery.${view.routine.door}`) })
            }
        >
            <form onSubmit={stop(view.routine.onRetry)}>
                <FieldStack>
                    <ActionRow>
                        <Input
                            id="sales-action-id"
                            name="sales-action-id"
                            label={t("routine.actionId")}
                            hint={t("routine.actionIdsHint", {
                                actions:
                                    view.routine.actionIds.length === 0 ? t("none") : view.routine.actionIds.join(", "),
                            })}
                            value={view.routine.actionId}
                            onValueChange={view.routine.setActionId}
                            isRequired
                        />
                        <Input
                            id="sales-attempt-generation"
                            name="sales-attempt-generation"
                            label={t("routine.attemptLabel")}
                            value={view.routine.attemptGeneration}
                            onValueChange={view.routine.setAttemptGeneration}
                            isRequired
                        />
                    </ActionRow>
                    <Input
                        id="sales-action-revision"
                        name="sales-action-revision"
                        label={t("routine.expectedRevision")}
                        value={view.routine.revision}
                        onValueChange={view.routine.setRevision}
                        isRequired
                    />
                    <Text size="sm" weight="semibold">
                        {t("recovery.proof")}
                    </Text>
                    <Text size="sm">{view.routine.attestedProof ?? t("recovery.noProof")}</Text>
                    <Text size="xs" tone="muted">
                        {t("recovery.fence", {
                            fence:
                                view.routine.attestedFence === null
                                    ? t("none")
                                    : view.routine.attestedFence.claimTokenHash,
                        })}
                    </Text>
                    <Input
                        id="sales-receiver-intent"
                        name="sales-receiver-intent"
                        label={t("recovery.receiverIntent")}
                        value={view.routine.receiverIntentId}
                        onValueChange={view.routine.setReceiverIntentId}
                    />
                    <Input
                        id="sales-receiver-attempt"
                        name="sales-receiver-attempt"
                        label={t("recovery.receiverAttempt")}
                        value={view.routine.receiverAttemptId}
                        onValueChange={view.routine.setReceiverAttemptId}
                    />
                    <Input
                        id="sales-recovery-fingerprint"
                        name="sales-recovery-fingerprint"
                        label={t("recovery.fingerprint")}
                        hint={t("recovery.fingerprintHint")}
                        value={view.routine.fingerprint}
                        onValueChange={view.routine.setFingerprint}
                    />
                    <ActionRow>
                        <Button
                            size="lg"
                            type="submit"
                            variant="primary"
                            isPending={view.routine.isRecovering}
                            isDisabled={!scopeReady || !view.routine.addressable || view.routine.door !== "retry"}
                        >
                            {t("recovery.retry")}
                        </Button>
                        <Button
                            size="lg"
                            type="button"
                            variant="secondary"
                            isPending={view.routine.isRecovering}
                            isDisabled={!scopeReady || !view.routine.addressable || view.routine.door !== "retry"}
                            onPress={view.routine.onStop}
                        >
                            {t("recovery.stop")}
                        </Button>
                    </ActionRow>
                    <Text size="xs" tone="muted">
                        {t("recovery.doorNote")}
                    </Text>
                </FieldStack>
            </form>
        </SurfaceCard>
    )

    const wait = () => (
        <SurfaceCard label={t("wait.label")} fact={view.wait.model === null ? undefined : view.wait.model.customerRef}>
            {region(
                view.wait.standing,
                t("wait.empty"),
                t("wait.emptyHint"),
                view.wait.model === null ? null : (
                    <FieldStack>
                        <ActionRow>
                            <Text weight="semibold">{view.wait.model.purpose}</Text>
                            <Badge tone={toneFor(LIFECYCLE_TONES, view.wait.model.status)}>
                                {lifecycleText(view.wait.model.status)}
                            </Badge>
                            <Badge tone={toneFor(WORK_STATE_TONES, view.wait.model.workState)}>
                                {workStateText(view.wait.model.workState)}
                            </Badge>
                        </ActionRow>
                        <Row>
                            <Text size="sm">
                                {t("wait.reason")}: {reasonText(view.wait.model.reason)}
                            </Text>
                            <Text size="sm">
                                {t("wait.nextStep")}: {workStateText(view.wait.model.workState)}
                            </Text>
                        </Row>
                        <Text size="xs" tone="muted">
                            {t("wait.evidence", {
                                refs:
                                    view.wait.model.evidenceRefs.length === 0
                                        ? t("none")
                                        : view.wait.model.evidenceRefs.join(", "),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("wait.identity", {
                                opportunity: view.wait.model.opportunityId,
                                revision: view.wait.model.revision,
                                customer: view.wait.model.customerRef,
                            })}
                        </Text>
                        {view.wait.model.closedAt === null ? null : (
                            <Text size="xs" tone="muted">
                                {t("wait.closedAt", { at: formatSalesInstant(view.wait.model.closedAt, format) })}
                            </Text>
                        )}
                    </FieldStack>
                ),
            )}
            <form onSubmit={stop(() => undefined)}>
                <ActionRow>
                    <Input
                        id="sales-opportunity-id"
                        name="sales-opportunity-id"
                        label={t("wait.opportunityId")}
                        hint={t("wait.opportunityIdHint")}
                        value={view.wait.opportunityId}
                        onValueChange={view.wait.setOpportunityId}
                    />
                    <Button size="lg" type="button" variant="ghost" onPress={view.wait.reload}>
                        {t("reload")}
                    </Button>
                </ActionRow>
            </form>
        </SurfaceCard>
    )

    const closure = () => (
        <SurfaceCard
            label={t("closure.label")}
            fact={view.closure.model === null ? undefined : lifecycleText(view.closure.model.status)}
        >
            <form onSubmit={stop(view.closure.onClose)}>
                <div className={SALES_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="sales-close-intent"
                        name="sales-close-intent"
                        label={t("closure.intentId")}
                        hint={t("closure.intentIdHint")}
                        value={view.closure.intentId}
                        onValueChange={view.closure.setIntentId}
                        isRequired
                    />
                    <Input
                        id="sales-close-opportunity"
                        name="sales-close-opportunity"
                        label={t("closure.opportunityId")}
                        value={view.wait.opportunityId}
                        onValueChange={view.wait.setOpportunityId}
                        isRequired
                    />
                    <Select
                        name="sales-close-outcome"
                        label={t("closure.outcome")}
                        options={[
                            { id: "won", label: t(salesOutcomeKey("won")) },
                            { id: "lost", label: t(salesOutcomeKey("lost")) },
                            { id: "attention", label: t(salesOutcomeKey("attention")) },
                        ]}
                        value={view.closure.outcome}
                        onValueChange={(value) => setOutcome(closeOutcomeOf(value ?? "won"))}
                    />
                    <Input
                        id="sales-close-evidence"
                        name="sales-close-evidence"
                        label={t("closure.evidence")}
                        hint={t("evidenceRefsHint")}
                        value={view.closure.evidenceRefs}
                        onValueChange={view.closure.setEvidenceRefs}
                    />
                    <Input
                        id="sales-close-order"
                        name="sales-close-order"
                        label={t("closure.order")}
                        hint={t("closure.orderHint")}
                        value={view.closure.orderId}
                        onValueChange={view.closure.setOrderId}
                    />
                    <Input
                        id="sales-close-revision"
                        name="sales-close-revision"
                        label={t("closure.revision")}
                        hint={t("closure.revisionHint")}
                        value={view.closure.revision}
                        onValueChange={view.closure.setRevision}
                        isRequired
                    />
                    <div className={SALES_FORM_FULL_SPAN_CLASS_NAME}>
                        <ActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.closure.isClosing}
                                isDisabled={!scopeReady || !view.closure.addressable}
                            >
                                {t("closure.close")}
                            </Button>
                        </ActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.closure.standing,
                t("closure.empty"),
                t("closure.emptyHint"),
                view.closure.model === null ? null : (
                    <FieldStack>
                        <ActionRow>
                            <Badge tone={toneFor(LIFECYCLE_TONES, view.closure.model.status)}>
                                {lifecycleText(view.closure.model.status)}
                            </Badge>
                            <Badge tone={toneFor(WORK_STATE_TONES, view.closure.model.workState)}>
                                {workStateText(view.closure.model.workState)}
                            </Badge>
                            <Text size="xs" tone="muted">
                                {t("wait.identity", {
                                    opportunity: view.closure.model.opportunityId,
                                    revision: view.closure.model.revision,
                                    customer: view.closure.model.customerRef,
                                })}
                            </Text>
                        </ActionRow>
                        {view.closure.model.closedAt === null ? (
                            <Text size="sm" tone="accent">
                                {t("closure.openNote")}
                            </Text>
                        ) : (
                            <Text size="sm" tone="accent">
                                {t("closure.closedAt", { at: formatSalesInstant(view.closure.model.closedAt, format) })}
                            </Text>
                        )}
                    </FieldStack>
                ),
            )}
        </SurfaceCard>
    )

    /* The readiness fact, or nothing at all when the read disclosed no installation state. */
    const installationFact = (): string | undefined => {
        const model = view.installation.model
        if (model === null) return undefined
        return model.ready ? t("installation.ready") : t("installation.notReady")
    }

    const installation = () => (
        <SurfaceCard label={t("installation.label")} fact={installationFact()}>
            {region(
                view.installation.standing,
                t("installation.empty"),
                t("installation.emptyHint"),
                view.installation.model === null ? null : (
                    <FieldStack>
                        <ActionRow>
                            <Badge tone={view.installation.model.ready ? "success" : "warning"}>
                                {view.installation.model.ready ? t("installation.ready") : t("installation.notReady")}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.installation.model.revision })}</Badge>
                        </ActionRow>
                        <Text size="xs" tone="muted">
                            {t("installation.observedAt", {
                                at: formatSalesInstant(view.installation.model.observedAt, format),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("installation.identity", {
                                lifecycle: view.installation.model.lifecycleIntentId,
                                configuration: view.installation.model.configurationRevision,
                            })}
                        </Text>
                    </FieldStack>
                ),
            )}
            <ActionRow>
                <Button size="lg" variant="ghost" onPress={view.installation.reload}>
                    {t("reload")}
                </Button>
            </ActionRow>
        </SurfaceCard>
    )

    const policy = () => (
        <SurfaceCard
            label={t("policy.label")}
            fact={
                view.policy.model === null
                    ? undefined
                    : t("policy.revisionFact", { revision: view.policy.model.revision })
            }
        >
            <form onSubmit={stop(view.policy.onConfigure)}>
                <FieldStack>
                    <Input
                        id="sales-policy-revision"
                        name="sales-policy-revision"
                        label={t("policy.expectedRevision")}
                        hint={t("policy.expectedRevisionHint")}
                        value={view.policy.revision}
                        onValueChange={view.policy.setRevision}
                    />
                    <Input
                        id="sales-policy-cadence"
                        name="sales-policy-cadence"
                        label={t("policy.cadence")}
                        hint={t("policy.cadenceHint")}
                        value={view.policy.cadence}
                        onValueChange={view.policy.setCadence}
                    />
                    <ActionRow>
                        <Button
                            size="lg"
                            type="submit"
                            variant="secondary"
                            isPending={view.policy.isConfiguring}
                            isDisabled={!scopeReady}
                        >
                            {t("policy.configure")}
                        </Button>
                    </ActionRow>
                    <Text size="xs" tone="muted">
                        {t("policy.unsetNote")}
                    </Text>
                </FieldStack>
            </form>
            {view.policy.model === null ? null : (
                <FieldStack>
                    <Text size="xs" tone="muted">
                        {t("policy.unsetItems", {
                            items:
                                view.policy.model.unsetItems.length === 0
                                    ? t("none")
                                    : view.policy.model.unsetItems.join(", "),
                        })}
                    </Text>
                </FieldStack>
            )}
        </SurfaceCard>
    )

    const rail = () => (
        <FieldStack>
            <SurfaceCard label={t("rail.scope")}>
                <ScopeLine scopeReady={scopeReady} scopeStanding={scopeStanding} t={t} />
            </SurfaceCard>
            {wait()}
            <SurfaceCard label={t("rail.notice")}>
                {notice === null ? (
                    <Text size="xs" tone="muted">
                        {t("rail.noticeEmpty")}
                    </Text>
                ) : (
                    <StatusNotice notice={notice} />
                )}
            </SurfaceCard>
            {installation()}
            {policy()}
        </FieldStack>
    )

    const primary = () => (
        <FieldStack>
            <SectionHeader level={2} title={t("attention.title")} description={t("attention.description")} />
            {commandBand()}
            {attention()}
            <div className={SALES_OPERATIONS_GRID_CLASS_NAME}>
                {history()}
                {routine()}
            </div>
            <div className={SALES_OPERATIONS_GRID_CLASS_NAME}>
                {ambiguity()}
                {recovery()}
            </div>
            {closure()}
        </FieldStack>
    )

    return (
        <div
            className={SALES_WORKBENCH_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={view.attention.standing === "loading" ? true : undefined}
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
