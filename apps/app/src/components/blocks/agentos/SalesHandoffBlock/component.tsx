import { LoadingRegion } from "@/components/blocks/loading/LoadingRegion"
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
import type { SalesHandoffValue } from "@/modules/api/sales"
import type { useSalesHandoff } from "@/hooks"
import {
    salesNoticeLive,
    salesWording,
    type SalesNotice,
    type SalesSurfaceStanding,
    type SalesTranslation,
} from "@/modules/sales/sales-workbench"
import { WorkbenchRail } from "../WorkbenchRail"
import {
    SALES_HANDOFF_ACTION_ROW_CLASS_NAME,
    SALES_HANDOFF_CLASS_NAME,
    SALES_HANDOFF_FIELD_STACK_CLASS_NAME,
    SALES_HANDOFF_FORM_FULL_SPAN_CLASS_NAME,
    SALES_HANDOFF_FORM_GRID_CLASS_NAME,
    SALES_HANDOFF_ROW_CLASS_NAME,
} from "./classNames"

/*
 * The handoff surface's drawing half. It renders one settled view and resolves nothing itself: the
 * scope, the read's disclosure and the one submission's press all arrive through `props.view`, so
 * every state this file draws can be rendered from a fixture and the same file stays valid when its
 * connected owner lands beside it.
 *
 * AN ADMISSION IS INTAKE ONLY. The one status that reads as done from Accounting is the receipt of
 * intake, so the surface states that boundary beside it rather than letting the word carry more than
 * the receipt does.
 */

/** One handoff status's label key; a status this build does not know stays the source's own word. */
const HANDOFF_STATUS_KEYS: Readonly<Record<string, string>> = {
    prepared: "status.prepared",
    queued: "status.queued",
    "possible-start": "status.possibleStart",
    "accounting-admitted": "status.accountingAdmitted",
    "accounting-refused": "status.accountingRefused",
    "accounting-cancelled": "status.accountingCancelled",
    "preflight-unavailable": "status.preflightUnavailable",
    "outcome-unknown": "status.outcomeUnknown",
}

/** The tone one disclosed status takes; an unknown status is neutral rather than alarming. */
const HANDOFF_STATUS_TONES: Readonly<Record<string, "success" | "warning" | "neutral">> = {
    prepared: "warning",
    queued: "neutral",
    "possible-start": "warning",
    "accounting-admitted": "success",
    "accounting-refused": "warning",
    "accounting-cancelled": "neutral",
    "preflight-unavailable": "warning",
    "outcome-unknown": "warning",
}

/** The statuses whose attempt may already have started; after them only the same identity is looked up. */
const HANDOFF_LOOKUP_ONLY_STATUSES: ReadonlySet<string> = new Set(["possible-start", "outcome-unknown"])




/** The settled view the drawing half receives; opaque so actions stay out of the atom check. */
type SalesHandoffBlockData = { readonly view: ReturnType<typeof useSalesHandoff> }
type SalesHandoffBlockProps = { readonly props: SalesHandoffBlockData }
type ChildrenProps = { readonly children: ReactNode }
type NoticeProps = { readonly notice: SalesNotice | null }
type FormSubmit = { readonly preventDefault: () => void }
type ScopeLineProps = {
    readonly scopeReady: boolean
    readonly scopeStanding: SalesSurfaceStanding
    readonly t: SalesTranslation
}

const Row = ({ children }: ChildrenProps) => (
    <div className={SALES_HANDOFF_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">
        {children}
    </div>
)
const FieldStack = ({ children }: ChildrenProps) => (
    <div className={SALES_HANDOFF_FIELD_STACK_CLASS_NAME}>{children}</div>
)
const ActionRow = ({ children }: ChildrenProps) => (
    <div className={SALES_HANDOFF_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">
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
const toneFor = (state: string): "success" | "warning" | "neutral" => HANDOFF_STATUS_TONES[state] ?? "neutral"

/** Whether one disclosed status leaves only a lookup of the same identity open. */
const lookupOnly = (status: string): boolean => HANDOFF_LOOKUP_ONLY_STATUSES.has(status)

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

/** Render the complete responsive handoff surface from a settled controller view. */
export const SalesHandoffBlockBase = (props: SalesHandoffBlockProps) => {
    const { view } = props.props
    const { t, scopeWorkspace, scopeInstallation, scopeReady, scopeStanding, notice, handoff, submission } = view
    const model = handoff.model
    const stop = (handler: () => void) => (event: FormSubmit) => {
        event.preventDefault()
        handler()
    }
    const statusText = (status: string): string => salesWording(HANDOFF_STATUS_KEYS[status] ?? null, status, t)
    const status = model?.status ?? ""
    const mayLookupOnly = model !== null && lookupOnly(model.status)

    /* One surface's standing around the content it settled to; a refusal to read is not an empty read. */
    const region = (standing: SalesSurfaceStanding, empty: string, emptyHint: string, children: ReactNode) => {
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

    /* The handoff's disclosed facts, each one exactly as the read returned it. */
    const facts = (settled: SalesHandoffValue) => (
        <FieldStack>
            <ActionRow>
                <Badge tone={toneFor(settled.status)}>{statusText(settled.status)}</Badge>
                <Badge tone="neutral">{t("handoff.revision", { revision: settled.revision })}</Badge>
            </ActionRow>
            <Row>
                <Text size="sm">
                    {t("handoff.identity", { handoff: settled.handoffId, order: settled.orderRevision })}
                </Text>
                <Text size="xs" tone="muted">
                    {settled.actionId === null
                        ? t("handoff.actionNone")
                        : t("handoff.action", { action: settled.actionId })}
                </Text>
            </Row>
        </FieldStack>
    )

    const handoffCard = () => (
        <SurfaceCard label={t("handoff.label")} fact={model === null ? undefined : statusText(model.status)}>
            {region(handoff.standing, t("handoff.empty"), t("handoff.emptyHint"), model === null ? null : facts(model))}
            <form onSubmit={stop(() => undefined)}>
                <FieldStack>
                    <Input
                        id="sales-handoff-id"
                        name="sales-handoff-id"
                        label={t("handoff.handoffId")}
                        hint={t("handoff.handoffIdHint")}
                        value={handoff.handoffId}
                        onValueChange={handoff.setHandoffId}
                    />
                    <ActionRow>
                        <Button
                            size="lg"
                            type="button"
                            variant="ghost"
                            isPending={handoff.isLoading}
                            onPress={handoff.reload}
                        >
                            {t("handoff.reload")}
                        </Button>
                    </ActionRow>
                </FieldStack>
            </form>
            {status !== "accounting-admitted" ? null : (
                <Text size="xs" tone="muted">
                    {t("handoff.intakeOnly")}
                </Text>
            )}
        </SurfaceCard>
    )

    const submissionCard = () => (
        <SurfaceCard label={t("submission.label")} fact={model === null ? undefined : statusText(model.status)}>
            <form onSubmit={stop(submission.onSubmit)}>
                <div className={SALES_HANDOFF_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="sales-handoff-fingerprint"
                        name="sales-handoff-fingerprint"
                        label={t("submission.fingerprint")}
                        hint={t("submission.fingerprintHint")}
                        value={submission.fingerprint}
                        onValueChange={submission.setFingerprint}
                        isRequired
                    />
                    <Input
                        id="sales-handoff-revision"
                        name="sales-handoff-revision"
                        label={t("submission.expectedRevision")}
                        hint={t("submission.expectedRevisionHint")}
                        value={submission.expectedRevision}
                        onValueChange={submission.setExpectedRevision}
                        isRequired
                    />
                    <div className={SALES_HANDOFF_FORM_FULL_SPAN_CLASS_NAME}>
                        <FieldStack>
                            {submission.isSubmitting ? (
                                <Text size="sm" tone="muted" live="polite">
                                    {t("submission.submitting")}
                                </Text>
                            ) : null}
                            <ActionRow>
                                <Button
                                    size="lg"
                                    type="submit"
                                    variant="primary"
                                    isPending={submission.isSubmitting}
                                    isDisabled={
                                        !scopeReady || !submission.addressable || submission.standing !== "ready"
                                    }
                                >
                                    {t("submission.submit")}
                                </Button>
                            </ActionRow>
                            <Text size="xs" tone="muted">
                                {mayLookupOnly ? t("submission.lookupOnly") : t("submission.held")}
                            </Text>
                        </FieldStack>
                    </div>
                </div>
            </form>
            <Text size="xs" tone="muted">
                {t("submission.note")}
            </Text>
        </SurfaceCard>
    )

    const rail = () => (
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

    const primary = () => (
        <FieldStack>
            <SectionHeader level={2} title={t("title")} description={t("description")} />
            {handoffCard()}
            {submissionCard()}
        </FieldStack>
    )

    return (
        <div
            className={SALES_HANDOFF_CLASS_NAME}
            data-contract="GAP-5 MEASURE-2"
            aria-busy={handoff.standing === "loading" ? true : undefined}
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
