import { LoadingRegion } from "@/components/blocks/loading/LoadingRegion"
import type { ReactNode } from "react"
import { Badge, Button, EmptyNotice, Input, SurfaceCard, Text } from "@starci/grammar/common"
import type { SalesHandoffValue } from "@/modules/api/sales"
import type { useSalesHandoff } from "@/hooks"
import { salesWording, type SalesSurfaceStanding } from "@/modules/sales/sales-workbench"
import {
    SALES_HANDOFF_ACTION_ROW_CLASS_NAME,
    SALES_HANDOFF_FIELD_STACK_CLASS_NAME,
    SALES_HANDOFF_FORM_FULL_SPAN_CLASS_NAME,
    SALES_HANDOFF_FORM_GRID_CLASS_NAME,
    SALES_HANDOFF_ROW_CLASS_NAME,
} from "./classNames"

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
const HANDOFF_LOOKUP_ONLY_STATUSES: ReadonlySet<string> = new Set(["possible-start", "outcome-unknown"])
type ChildrenProps = { readonly children: ReactNode }
type FormSubmitEvent = { readonly preventDefault: () => void }
const Row = (props: ChildrenProps) => <div className={SALES_HANDOFF_ROW_CLASS_NAME} data-contract="GAP-2 PADDING-4">{props.children}</div>
const FieldStack = (props: ChildrenProps) => <div className={SALES_HANDOFF_FIELD_STACK_CLASS_NAME}>{props.children}</div>
const ActionRow = (props: ChildrenProps) => <div className={SALES_HANDOFF_ACTION_ROW_CLASS_NAME} data-contract="GAP-2">{props.children}</div>
const toneFor = (state: string): "success" | "warning" | "neutral" => HANDOFF_STATUS_TONES[state] ?? "neutral"
const lookupOnly = (status: string): boolean => HANDOFF_LOOKUP_ONLY_STATUSES.has(status)
const stop = (handler: () => void) => (event: FormSubmitEvent) => {
    event.preventDefault()
    handler()
}
const resolveStatusText = (status: string, t: ReturnType<typeof useSalesHandoff>["t"]): string =>
    salesWording(HANDOFF_STATUS_KEYS[status] ?? null, status, t)
const region = (
    standing: SalesSurfaceStanding,
    empty: string,
    emptyHint: string,
    children: ReactNode,
    t: ReturnType<typeof useSalesHandoff>["t"],
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

/** The settled source consumed by each handoff card. */
export type SalesHandoffView = ReturnType<typeof useSalesHandoff>

type SalesHandoffReadbackCardProps = { readonly view: SalesHandoffView }

/** Draw the disclosed handoff identity and its safe reread action. */
export const SalesHandoffReadbackCard = (props: SalesHandoffReadbackCardProps) => {
    const view = props.view
    const { t, handoff } = view
    const model = handoff.model
    const status = model?.status ?? ""
    const statusText = (value: string) => resolveStatusText(value, t)
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
    return (
        <SurfaceCard label={t("handoff.label")} fact={model === null ? undefined : statusText(model.status)}>
            {region(
                handoff.standing,
                t("handoff.empty"),
                t("handoff.emptyHint"),
                model === null ? null : facts(model),
                t,
            )}
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
}

type SalesHandoffSubmissionCardProps = { readonly view: SalesHandoffView }

/** Draw the handoff submission controls and keep the lookup-only fence visible. */
export const SalesHandoffSubmissionCard = (props: SalesHandoffSubmissionCardProps) => {
    const view = props.view
    const { t, scopeReady, handoff, submission } = view
    const model = handoff.model
    const status = model?.status ?? ""
    const mayLookupOnly = model !== null && lookupOnly(model.status)
    const statusText = (value: string) => resolveStatusText(value, t)
    return (
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
}
