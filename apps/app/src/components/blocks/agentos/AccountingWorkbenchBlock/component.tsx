import type { ReactNode } from "react"
import {
    Badge,
    Button,
    EmptyNotice,
    Heading,
    Input,
    PrimaryRailLayout,
    Select,
    SectionHeader,
    SurfaceCard,
    SurfaceListCard,
    Text,
} from "@starci/grammar/common"
import type { AccountingSummaryItemPayload } from "@/modules/api/accounting"
import type { useAccountingWorkbench } from "@/hooks"
import {
    accountingAttentionKey,
    accountingAvailabilityKey,
    accountingCorrectionStateKey,
    accountingEvidenceStateKey,
    accountingExceptionStateKey,
    accountingFactFieldKey,
    accountingMatchStatusKey,
    accountingMeasureKey,
    accountingMeasureReading,
    accountingNoticeLive,
    accountingPartialReasonKey,
    accountingRoutineStateKey,
    accountingTreatmentKey,
    type AccountingNotice,
    type AccountingSurfaceStanding,
    type AccountingTranslation,
} from "@/modules/accounting/accounting-workbench"
import {
    ACCOUNTING_ACTION_ROW_CLASS_NAME,
    ACCOUNTING_FIELD_STACK_CLASS_NAME,
    ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME,
    ACCOUNTING_FORM_GRID_CLASS_NAME,
    ACCOUNTING_OPERATIONS_GRID_CLASS_NAME,
    ACCOUNTING_ROW_CLASS_NAME,
    ACCOUNTING_SUMMARY_GRID_CLASS_NAME,
    ACCOUNTING_WORKBENCH_CLASS_NAME,
} from "./classNames"

/** The settled view the render half draws; the connected owner resolves everything it shows. */
type AccountingWorkbenchBlockData = { readonly view: ReturnType<typeof useAccountingWorkbench> }
type AccountingWorkbenchBlockProps = { readonly props: AccountingWorkbenchBlockData }
type ChildrenProps = { readonly children: ReactNode }
type StatusNoticeProps = { readonly notice: AccountingNotice | null }

const Row = ({ children }: ChildrenProps) => (
    <div className={ACCOUNTING_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {children}
    </div>
)
const FieldStack = ({ children }: ChildrenProps) => <div className={ACCOUNTING_FIELD_STACK_CLASS_NAME}>{children}</div>
const ActionRow = ({ children }: ChildrenProps) => (
    <div className={ACCOUNTING_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
        {children}
    </div>
)

/*
 * A period measure is shown as a total only while every covered item's measure of that kind is
 * known. One unknown reason withholds the total and names the reason: a partial sum printed as a
 * period figure is a number nobody measured.
 */
const measureBand = (
    items: ReadonlyArray<AccountingSummaryItemPayload>,
    kind: string,
):
    | { readonly amountMinor: number; readonly currency: string; readonly covered: number }
    | { readonly reasonCode: string }
    | null => {
    const readings = items.flatMap((item) =>
        item.measures.filter((measure) => measure.kind === kind).map((measure) => accountingMeasureReading(measure)),
    )
    if (readings.length === 0) return null
    const unknown = readings.find((reading): reading is { readonly reasonCode: string } => "reasonCode" in reading)
    if (unknown !== undefined) return unknown
    const known = readings as ReadonlyArray<{ readonly amountMinor: number; readonly currency: string }>
    const [firstKnown] = known
    return firstKnown === undefined
        ? null
        : {
              amountMinor: known.reduce((total, reading) => total + reading.amountMinor, 0),
              currency: firstKnown.currency,
              covered: items.length,
          }
}

const StatusNotice = ({ notice }: StatusNoticeProps) =>
    notice === null ? null : (
        <Text live={accountingNoticeLive(notice.kind)} tone={notice.kind === "success" ? "accent" : "default"}>
            {notice.message}
        </Text>
    )

type MeasureBandReading =
    | { readonly amountMinor: number; readonly currency: string; readonly covered: number }
    | { readonly reasonCode: string }
type MeasureValueProps = {
    readonly band: MeasureBandReading | null
    readonly amount: (amountMinor: number, currency: string) => string
    readonly t: AccountingTranslation
}

/** One measure band's value: the amount with its coverage, the withheld reason, or the absent note. */
const MeasureValue = ({ band, amount, t }: MeasureValueProps) => {
    if (band === null)
        return (
            <Text size="sm" tone="muted">
                {t("overview.measureAbsent")}
            </Text>
        )
    if ("reasonCode" in band)
        return (
            <Text size="sm" tone="accent">
                {t("overview.measureUnknown", { reason: band.reasonCode })}
            </Text>
        )
    return (
        <>
            <Heading level={3}>{amount(band.amountMinor, band.currency)}</Heading>
            <Text size="xs" tone="muted">
                {t("overview.measureCovered", { count: band.covered })}
            </Text>
        </>
    )
}

type BadgeTone = "success" | "warning" | "neutral"
/** The tone one closed state's badge takes; a state this build does not know is neutral. */
const toneFor = (tones: Readonly<Record<string, BadgeTone>>, state: string): BadgeTone => tones[state] ?? "neutral"
const EVIDENCE_TONES: Readonly<Record<string, BadgeTone>> = {
    ready: "success",
    rejected: "warning",
    unreadable: "warning",
}
const ROUTINE_TONES: Readonly<Record<string, BadgeTone>> = { committed: "success", denied: "warning" }
const CORRECTION_TONES: Readonly<Record<string, BadgeTone>> = { applied: "success", blocked: "warning" }

type FormSubmit = { readonly preventDefault: () => void }
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: AccountingSurfaceStanding
    readonly t: AccountingTranslation
}

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

/** Render the complete responsive Accounting workbench from a settled controller view. */
export const AccountingWorkbenchBlockBase = (props: AccountingWorkbenchBlockProps) => {
    const { view } = props.props
    const {
        t,
        scopeReady,
        scopeStanding,
        notice,
        currency,
        setCurrency,
        periodMonth,
        setPeriodMonth,
        asOf,
        asOfDraft,
        setAsOf,
        setAsOfDraft,
    } = view
    const amount = view.format.amount
    const estimateCurrency = view.overview.model?.currency ?? null
    const stop = (handler: () => void) => (event: FormSubmit) => {
        event.preventDefault()
        handler()
    }

    /* One surface's standing around the content it settled to; a refusal to read is not an empty read. */
    const region = (standing: AccountingSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => {
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

    const overview = (
        <SurfaceCard
            label={t("overview.label")}
            fact={t("overview.covered", { count: view.overview.model?.items.length ?? 0 })}
        >
            <div className={ACCOUNTING_SUMMARY_GRID_CLASS_NAME}>
                <FieldStack>
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
                    <ActionRow>
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
                    </ActionRow>
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
                            {t("overview.loadMore")}
                        </Button>
                    )}
                </FieldStack>
                <FieldStack>
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
                                const band = measureBand(view.overview.model?.items ?? [], kind)
                                return (
                                    <Row key={kind}>
                                        <Text size="sm" weight="semibold">
                                            {t(accountingMeasureKey(kind))}
                                        </Text>
                                        <MeasureValue band={band} amount={amount} t={t} />
                                    </Row>
                                )
                            })}
                            {estimateCurrency === null ? null : (
                                <Text size="xs" tone="muted">
                                    {t("overview.estimate", { currency: estimateCurrency })}
                                </Text>
                            )}
                        </>,
                    )}
                </FieldStack>
            </div>
        </SurfaceCard>
    )

    const intake = (
        <SurfaceCard label={t("intake.label")}>
            <form onSubmit={stop(view.intake.onAdmit)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-evidence-id"
                        name="accounting-evidence-id"
                        label={t("intake.evidenceId")}
                        hint={t("intake.evidenceIdHint")}
                        value={view.intake.evidenceId}
                        onValueChange={view.intake.setEvidenceId}
                        isRequired
                    />
                    <Input
                        id="accounting-source-kind"
                        name="accounting-source-kind"
                        label={t("intake.sourceKind")}
                        value={view.intake.sourceKind}
                        onValueChange={view.intake.setSourceKind}
                        isRequired
                    />
                    <Input
                        id="accounting-source-ref"
                        name="accounting-source-ref"
                        label={t("intake.sourceRef")}
                        value={view.intake.sourceRef}
                        onValueChange={view.intake.setSourceRef}
                        isRequired
                    />
                    <Input
                        id="accounting-source-revision"
                        name="accounting-source-revision"
                        label={t("intake.sourceRevision")}
                        value={view.intake.sourceRevision}
                        onValueChange={view.intake.setSourceRevision}
                        isRequired
                    />
                    <Input
                        id="accounting-fingerprint"
                        name="accounting-fingerprint"
                        label={t("intake.fingerprint")}
                        hint={t("intake.fingerprintHint")}
                        value={view.intake.fingerprint}
                        onValueChange={view.intake.setFingerprint}
                        isRequired
                    />
                    <Input
                        id="accounting-intake-revision"
                        name="accounting-intake-revision"
                        label={t("intake.expectedRevision")}
                        value={view.intake.intakeRevision}
                        onValueChange={view.intake.setIntakeRevision}
                        isRequired
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <ActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.intake.isAdmitting}
                                isDisabled={
                                    !scopeReady ||
                                    view.intake.evidenceId.length === 0 ||
                                    view.intake.sourceKind.length === 0 ||
                                    view.intake.sourceRef.length === 0 ||
                                    view.intake.sourceRevision.length === 0 ||
                                    view.intake.fingerprint.length === 0
                                }
                            >
                                {t("intake.admit")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.intake.reload}>
                                {t("reload")}
                            </Button>
                        </ActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.intake.standing,
                t("intake.empty"),
                t("intake.emptyHint"),
                view.intake.model === null ? null : (
                    <Row>
                        <ActionRow>
                            <Text weight="semibold">{view.intake.model.evidenceId}</Text>
                            <Badge tone={toneFor(EVIDENCE_TONES, view.intake.model.state)}>
                                {t(accountingEvidenceStateKey(view.intake.model.state))}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.intake.model.revision })}</Badge>
                        </ActionRow>
                        <Text size="sm">
                            {view.intake.model.missingFacts.length === 0
                                ? t("intake.noMissingFacts")
                                : t("intake.missingFacts", { facts: view.intake.model.missingFacts.join(", ") })}
                        </Text>
                        {view.intake.model.state === "likely_duplicate" ? (
                            <Text size="sm" tone="accent">
                                {t("intake.duplicateNotice")}
                            </Text>
                        ) : null}
                        {view.intake.model.state === "needs_information" ? (
                            <Text size="sm" tone="accent">
                                {t("intake.conflictNotice")}
                            </Text>
                        ) : null}
                    </Row>
                ),
            )}
        </SurfaceCard>
    )

    const routine = (
        <SurfaceCard label={t("routine.label")}>
            <form onSubmit={stop(view.routine.onCommitRoutine)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-intent-id"
                        name="accounting-intent-id"
                        label={t("routine.intentId")}
                        value={view.routine.intentId}
                        onValueChange={view.routine.setIntentId}
                        isRequired
                    />
                    <Input
                        id="accounting-item-id"
                        name="accounting-item-id"
                        label={t("routine.itemId")}
                        value={view.routine.itemId}
                        onValueChange={view.routine.setItemId}
                        isRequired
                    />
                    <Input
                        id="accounting-policy-revision"
                        name="accounting-policy-revision"
                        label={t("routine.policyRevision")}
                        value={view.routine.policyRevision}
                        onValueChange={view.routine.setPolicyRevision}
                        isRequired
                    />
                    <Input
                        id="accounting-evidence-ids"
                        name="accounting-evidence-ids"
                        label={t("routine.evidenceIds")}
                        hint={t("routine.evidenceIdsHint")}
                        value={view.routine.evidenceIds}
                        onValueChange={view.routine.setEvidenceIds}
                        isRequired
                    />
                    <Input
                        id="accounting-item-revision"
                        name="accounting-item-revision"
                        label={t("routine.itemRevision")}
                        value={view.routine.itemRevision}
                        onValueChange={view.routine.setItemRevision}
                        isRequired
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <ActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.routine.isCommitting}
                                isDisabled={
                                    !scopeReady ||
                                    view.routine.intentId.length === 0 ||
                                    view.routine.itemId.length === 0 ||
                                    view.routine.policyRevision.length === 0
                                }
                            >
                                {t("routine.commit")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.routine.reload}>
                                {t("reload")}
                            </Button>
                        </ActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.routine.standing,
                t("routine.empty"),
                t("routine.emptyHint"),
                view.routine.model === null ? null : (
                    <Row>
                        <ActionRow>
                            <Text weight="semibold">{view.routine.model.intentId}</Text>
                            <Badge tone={toneFor(ROUTINE_TONES, view.routine.model.state)}>
                                {t(accountingRoutineStateKey(view.routine.model.state))}
                            </Badge>
                            {view.routine.model.reasonCode === null ? null : (
                                <Badge tone="neutral">{view.routine.model.reasonCode}</Badge>
                            )}
                        </ActionRow>
                        <Text size="sm">
                            {t("routine.readback", {
                                item: view.routine.model.itemId ?? t("none"),
                                attempt: view.routine.model.attemptId ?? t("none"),
                            })}
                        </Text>
                        {view.routine.model.receiptId === null ? null : (
                            <Text size="xs" tone="muted">
                                {t("routine.receipt", {
                                    receipt: view.routine.model.receiptId,
                                    result: view.routine.model.resultId ?? t("none"),
                                })}
                            </Text>
                        )}
                        {view.routine.model.state === "outcome-unknown" ? (
                            <Text size="sm" tone="accent" live="polite">
                                {t("routine.unknownNotice")}
                            </Text>
                        ) : null}
                    </Row>
                ),
            )}
            <form onSubmit={stop(view.routine.onRetryRoutine)}>
                <FieldStack>
                    <Text size="xs" tone="muted">
                        {t("routine.retryHint")}
                    </Text>
                    <Input
                        id="accounting-old-attempt"
                        name="accounting-old-attempt"
                        label={t("routine.oldAttemptId")}
                        value={view.routine.oldAttemptId}
                        onValueChange={view.routine.setOldAttemptId}
                    />
                    <Input
                        id="accounting-not-started-proof"
                        name="accounting-not-started-proof"
                        label={t("routine.notStartedProofRef")}
                        value={view.routine.notStartedProofRef}
                        onValueChange={view.routine.setNotStartedProofRef}
                    />
                    <Input
                        id="accounting-new-attempt"
                        name="accounting-new-attempt"
                        label={t("routine.newAttemptId")}
                        value={view.routine.newAttemptId}
                        onValueChange={view.routine.setNewAttemptId}
                    />
                    <Button
                        size="lg"
                        type="submit"
                        variant="secondary"
                        isPending={view.routine.isCommitting}
                        isDisabled={
                            !scopeReady ||
                            view.routine.intentId.length === 0 ||
                            view.routine.oldAttemptId.length === 0 ||
                            view.routine.notStartedProofRef.length === 0 ||
                            view.routine.newAttemptId.length === 0
                        }
                    >
                        {t("routine.retry")}
                    </Button>
                </FieldStack>
            </form>
        </SurfaceCard>
    )

    const question = (
        <SurfaceCard
            label={t("question.label")}
            fact={
                view.question.routineState === null
                    ? undefined
                    : t(accountingRoutineStateKey(view.question.routineState))
            }
        >
            {region(
                view.question.standing,
                t("question.empty"),
                t("question.emptyHint"),
                <FieldStack>
                    <Text size="sm" weight="semibold">
                        {t("question.why")}
                    </Text>
                    <Text size="sm">
                        {view.question.routineReason === null
                            ? t("question.whyUnknown")
                            : t("question.whyReason", { reason: view.question.routineReason })}
                    </Text>
                    <Text size="xs" tone="muted">
                        {t("question.attention", {
                            codes:
                                view.question.attention.length === 0 ? t("none") : view.question.attention.join(", "),
                        })}
                    </Text>
                    <Text size="sm" weight="semibold">
                        {t("question.evidence")}
                    </Text>
                    <Text size="sm">
                        {view.question.itemEvidenceRefs.length === 0
                            ? t("question.evidenceAbsent")
                            : view.question.itemEvidenceRefs.join(", ")}
                    </Text>
                    <Text size="sm" weight="semibold">
                        {t("question.alternatives")}
                    </Text>
                    <Text size="sm">{t("question.consequence")}</Text>
                    <form onSubmit={stop(view.question.onAnswer)}>
                        <FieldStack>
                            <Input
                                id="accounting-exception-id"
                                name="accounting-exception-id"
                                label={t("question.exceptionId")}
                                hint={t("question.exceptionIdHint")}
                                value={view.question.exceptionId}
                                onValueChange={view.question.setExceptionId}
                                isRequired
                            />
                            <Input
                                id="accounting-choice-code"
                                name="accounting-choice-code"
                                label={t("question.choiceCode")}
                                value={view.question.choiceCode}
                                onValueChange={view.question.setChoiceCode}
                            />
                            <Input
                                id="accounting-question-reason"
                                name="accounting-question-reason"
                                label={t("question.reason")}
                                value={view.question.reason}
                                onValueChange={view.question.setReason}
                            />
                            <Input
                                id="accounting-question-evidence"
                                name="accounting-question-evidence"
                                label={t("question.answerEvidenceRefs")}
                                hint={t("evidenceIdsHint")}
                                value={view.question.evidenceRefs}
                                onValueChange={view.question.setEvidenceRefs}
                            />
                            <Input
                                id="accounting-exception-revision"
                                name="accounting-exception-revision"
                                label={t("question.expectedRevision")}
                                value={view.question.exceptionRevision}
                                onValueChange={view.question.setExceptionRevision}
                                isRequired
                            />
                            <ActionRow>
                                <Button
                                    size="lg"
                                    type="submit"
                                    variant="primary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={
                                        !scopeReady ||
                                        view.question.exceptionId.length === 0 ||
                                        (view.question.choiceCode.length === 0 && view.question.reason.length === 0)
                                    }
                                >
                                    {t("question.answer")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onDefer}
                                >
                                    {t("question.defer")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onReopen}
                                >
                                    {t("question.reopen")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onEscalate}
                                >
                                    {t("question.escalate")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onDismiss}
                                >
                                    {t("question.dismiss")}
                                </Button>
                            </ActionRow>
                        </FieldStack>
                    </form>
                    {view.question.answerState === null ? null : (
                        <ActionRow>
                            <Text size="sm">
                                {view.question.answerState.state === "answered" ||
                                view.question.answerState.state === "resolved"
                                    ? t("question.settled")
                                    : t("question.pending")}
                            </Text>
                            <Badge
                                tone={
                                    view.question.answerState.state === "answered" ||
                                    view.question.answerState.state === "resolved"
                                        ? "success"
                                        : "warning"
                                }
                            >
                                {t(accountingExceptionStateKey(view.question.answerState.state))}
                            </Badge>
                        </ActionRow>
                    )}
                    {view.question.answerState === null ||
                    view.question.answerState.state === "open" ||
                    view.question.answerState.state === "deferred" ||
                    view.question.answerState.state === "dismissed" ? null : (
                        <Text size="xs" tone="accent">
                            {t("question.consequenceHeld")}
                        </Text>
                    )}
                </FieldStack>,
            )}
        </SurfaceCard>
    )

    const detail = (
        <SurfaceCard
            label={t("detail.label")}
            fact={view.detail.model === null ? undefined : t(`detail.${view.detail.model.state}`)}
        >
            <form onSubmit={stop(view.detail.onLoad)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-result-id"
                        name="accounting-result-id"
                        label={t("detail.resultId")}
                        value={view.detail.resultId}
                        onValueChange={view.detail.setResultId}
                    />
                    <Input
                        id="accounting-detail-item-id"
                        name="accounting-detail-item-id"
                        label={t("detail.itemId")}
                        hint={t("detail.asOfHint")}
                        value={view.detail.itemId}
                        onValueChange={view.detail.setItemId}
                    />
                    <Input
                        id="accounting-as-of"
                        name="accounting-as-of"
                        label={t("detail.asOf")}
                        hint={t("detail.asOfFormat")}
                        value={view.detail.asOfInstant}
                        onValueChange={view.detail.setAsOfInstant}
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <ActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.detail.isFetching}
                                isDisabled={
                                    !scopeReady ||
                                    (view.detail.asOfInstant.length === 0
                                        ? view.detail.resultId.length === 0
                                        : view.detail.itemId.length === 0)
                                }
                            >
                                {t("detail.load")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.detail.retry}>
                                {t("reload")}
                            </Button>
                        </ActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.detail.standing,
                t("detail.empty"),
                t("detail.emptyHint"),
                view.detail.model === null ? null : (
                    <FieldStack>
                        <ActionRow>
                            <Badge tone={view.detail.model.state === "current" ? "neutral" : "warning"}>
                                {t(`detail.${view.detail.model.state}`)}
                            </Badge>
                            <Badge tone="neutral">{t("revision", { value: view.detail.model.version })}</Badge>
                            <Text size="xs" tone="muted">
                                {t("detail.effectiveAt", {
                                    at: view.format.instant(view.detail.model.effectiveAt),
                                })}
                            </Text>
                        </ActionRow>
                        <Row>
                            <Text size="sm">
                                {t(accountingFactFieldKey("amountMinor"))}:{" "}
                                {view.detail.model.facts.amountMinor === null ||
                                view.detail.model.facts.currency === null
                                    ? t("none")
                                    : amount(view.detail.model.facts.amountMinor, view.detail.model.facts.currency)}
                            </Text>
                            <Text size="sm">
                                {t(accountingFactFieldKey("occurredOn"))}:{" "}
                                {view.detail.model.facts.occurredOn ?? t("none")}
                            </Text>
                            <Text size="sm">
                                {t(accountingFactFieldKey("counterpartyRef"))}:{" "}
                                {view.detail.model.facts.counterpartyRef ?? t("none")}
                            </Text>
                        </Row>
                        <ActionRow>
                            <Text size="sm">
                                {t("detail.matchStatus")}:{" "}
                                {t(accountingMatchStatusKey(view.detail.model.facts.matchStatus))}
                            </Text>
                            <Text size="sm">
                                {t("detail.treatment")}:{" "}
                                {t(accountingTreatmentKey(view.detail.model.facts.treatment.kind))}
                            </Text>
                            <Badge tone="neutral">
                                {view.detail.model.facts.treatment.kind === "supported"
                                    ? view.detail.model.facts.treatment.code
                                    : view.detail.model.facts.treatment.reasonCode}
                            </Badge>
                        </ActionRow>
                        <Text size="xs" tone="muted">
                            {t("detail.evidenceRefs", {
                                refs:
                                    view.detail.model.sourceEvidenceRefs.length === 0
                                        ? t("none")
                                        : view.detail.model.sourceEvidenceRefs.join(", "),
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("detail.receipt", {
                                receipt: view.detail.model.receiptId ?? t("none"),
                                policy: view.detail.model.policyRevision,
                            })}
                        </Text>
                        <Text size="xs" tone="muted">
                            {t("detail.lineage", {
                                predecessor: view.detail.model.predecessorResultId ?? t("none"),
                                successor: view.detail.model.successorResultId ?? t("none"),
                            })}
                        </Text>
                    </FieldStack>
                ),
            )}
        </SurfaceCard>
    )

    const correction = (
        <SurfaceCard label={t("correction.label")}>
            <form onSubmit={stop(view.correction.onPropose)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-correction-id"
                        name="accounting-correction-id"
                        label={t("correction.correctionId")}
                        value={view.correction.correctionId}
                        onValueChange={view.correction.setCorrectionId}
                        isRequired
                    />
                    <Input
                        id="accounting-predecessor"
                        name="accounting-predecessor"
                        label={t("correction.predecessorResultId")}
                        hint={t("correction.predecessorHint")}
                        value={view.correction.predecessorResultId}
                        onValueChange={view.correction.setPredecessorResultId}
                        isRequired
                    />
                    <Input
                        id="accounting-corrected-amount"
                        name="accounting-corrected-amount"
                        label={t("correction.correctedAmount")}
                        value={view.correction.correctedAmount}
                        onValueChange={view.correction.setCorrectedAmount}
                    />
                    <Input
                        id="accounting-corrected-counterparty"
                        name="accounting-corrected-counterparty"
                        label={t("correction.correctedCounterparty")}
                        value={view.correction.correctedCounterparty}
                        onValueChange={view.correction.setCorrectedCounterparty}
                    />
                    <Input
                        id="accounting-correction-reason"
                        name="accounting-correction-reason"
                        label={t("correction.reason")}
                        value={view.correction.reason}
                        onValueChange={view.correction.setReason}
                        isRequired
                    />
                    <Input
                        id="accounting-correction-evidence"
                        name="accounting-correction-evidence"
                        label={t("correction.evidenceRefs")}
                        hint={t("evidenceIdsHint")}
                        value={view.correction.evidenceRefs}
                        onValueChange={view.correction.setEvidenceRefs}
                    />
                    <Input
                        id="accounting-correction-revision"
                        name="accounting-correction-revision"
                        label={t("correction.expectedResultRevision")}
                        value={view.correction.correctionRevision}
                        onValueChange={view.correction.setCorrectionRevision}
                        isRequired
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <ActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.correction.isCorrecting}
                                isDisabled={
                                    !scopeReady ||
                                    view.correction.correctionId.length === 0 ||
                                    view.correction.predecessorResultId.length === 0 ||
                                    view.correction.reason.length === 0
                                }
                            >
                                {t("correction.propose")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.correction.reload}>
                                {t("reload")}
                            </Button>
                        </ActionRow>
                    </div>
                </div>
            </form>
            <form onSubmit={stop(view.correction.onAppend)}>
                <FieldStack>
                    <Text size="xs" tone="muted">
                        {t("correction.appendHint")}
                    </Text>
                    <Input
                        id="accounting-append-attempt"
                        name="accounting-append-attempt"
                        label={t("correction.attemptId")}
                        value={view.correction.appendAttemptId}
                        onValueChange={view.correction.setAppendAttemptId}
                    />
                    <Button
                        size="lg"
                        type="submit"
                        variant="secondary"
                        isPending={view.correction.isCorrecting}
                        isDisabled={
                            !scopeReady ||
                            view.correction.correctionId.length === 0 ||
                            view.correction.appendAttemptId.length === 0
                        }
                    >
                        {t("correction.append")}
                    </Button>
                </FieldStack>
            </form>
            {region(
                view.correction.standing,
                t("correction.empty"),
                t("correction.emptyHint"),
                <FieldStack>
                    {view.correction.predecessor === null ? null : (
                        <Row>
                            <Text size="sm" weight="semibold">
                                {t("correction.original")}
                            </Text>
                            <Text size="sm">
                                {view.correction.predecessor.resultId} ·{" "}
                                {view.correction.predecessor.facts.amountMinor === null ||
                                view.correction.predecessor.facts.currency === null
                                    ? t("none")
                                    : amount(
                                          view.correction.predecessor.facts.amountMinor,
                                          view.correction.predecessor.facts.currency,
                                      )}{" "}
                                · {view.correction.predecessor.facts.counterpartyRef ?? t("none")}
                            </Text>
                            <Text size="xs" tone="accent">
                                {t("correction.originalUnchanged")}
                            </Text>
                        </Row>
                    )}
                    {view.correction.model === null ? null : (
                        <Row>
                            <Text size="sm" weight="semibold">
                                {view.correction.model.correctionId}
                            </Text>
                            <ActionRow>
                                <Badge tone={toneFor(CORRECTION_TONES, view.correction.model.state)}>
                                    {t(accountingCorrectionStateKey(view.correction.model.state))}
                                </Badge>
                                <Text size="sm">
                                    {t("correction.lineage", {
                                        predecessor: view.correction.model.predecessorResultId ?? t("none"),
                                        result: view.correction.model.resultId ?? t("none"),
                                    })}
                                </Text>
                            </ActionRow>
                            {view.correction.model.state === "applied" && view.correction.model.resultId !== null ? (
                                <Text size="sm" tone="accent">
                                    {t("correction.appended", { result: view.correction.model.resultId })}
                                </Text>
                            ) : null}
                            {view.correction.model.state === "outcome_unknown" ||
                            view.correction.model.state === "possible_start" ? (
                                <Text size="sm" tone="accent" live="polite">
                                    {t("correction.unknownNotice")}
                                </Text>
                            ) : null}
                        </Row>
                    )}
                </FieldStack>,
            )}
        </SurfaceCard>
    )

    const rail = (
        <FieldStack>
            <SurfaceCard label={t("rail.scope")}>
                <ScopeLine scopeReady={scopeReady} scopeStanding={scopeStanding} t={t} />
            </SurfaceCard>
            <SurfaceListCard
                label={t("rail.attention")}
                fact={t("overview.itemCount", { count: view.overview.attention.length })}
                isLoading={view.overview.standing === "loading"}
            >
                {view.overview.attention.length === 0 ? (
                    <EmptyNotice message={t("rail.attentionEmpty")} description={t("rail.attentionEmptyHint")} />
                ) : (
                    view.overview.attention.map((code) => (
                        <Row key={code}>
                            <Text size="sm">
                                {accountingAttentionKey(code) === "attention.other"
                                    ? code
                                    : t(accountingAttentionKey(code))}
                            </Text>
                        </Row>
                    ))
                )}
            </SurfaceListCard>
            <SurfaceCard label={t("rail.asOf")}>
                <FieldStack>
                    <Input
                        id="accounting-asof-draft"
                        name="accounting-asof-draft"
                        label={t("rail.asOfValue")}
                        hint={t("rail.asOfHint")}
                        value={asOfDraft}
                        onValueChange={setAsOfDraft}
                    />
                    <ActionRow>
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
                    </ActionRow>
                    {asOf === null ? (
                        <Text size="xs" tone="muted">
                            {t("rail.current")}
                        </Text>
                    ) : (
                        <Text size="xs" tone="accent" live="polite">
                            {t("rail.historical")}
                        </Text>
                    )}
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

    const primary = (
        <FieldStack>
            <SectionHeader level={2} title={t("title")} description={t("description")} />
            {overview}
            <div className={ACCOUNTING_OPERATIONS_GRID_CLASS_NAME}>
                {intake}
                {routine}
            </div>
            <div className={ACCOUNTING_OPERATIONS_GRID_CLASS_NAME}>
                {question}
                {correction}
            </div>
            {detail}
        </FieldStack>
    )

    return (
        <div
            className={ACCOUNTING_WORKBENCH_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={view.overview.standing === "loading" ? true : undefined}
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
