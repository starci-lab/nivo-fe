import { Badge, EmptyNotice, IconTile, PrimaryRailLayout, Progress, SurfaceCard, Text } from "@starci/grammar/common"
import type {
    PurchaseStatusFact,
    PurchaseStatusFlowViewProps,
    PurchaseStatusOperation,
    PurchaseStatusPrimary,
    PurchaseStatusRail,
    PurchaseStatusTimelineRow,
} from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusActions } from "../PurchaseStatusActions"
import {
    BAND_CLASS_NAME,
    BANNER_CLASS_NAME,
    FACT_CELL_CLASS_NAME,
    FACT_GRID_CLASS_NAME,
    FACT_ROW_CLASS_NAME,
    NOTICE_CLASS_NAME,
    ROW_BODY_CLASS_NAME,
    ROW_CLASS_NAME,
    ROW_HEAD_CLASS_NAME,
} from "./classNames"
import { PurchaseStatusLoadingPreview } from "./loading"

/** Complete resolved purchase-status view contract consumed by the evidence-card block. */
export type PurchaseStatusChecksProps = PurchaseStatusFlowViewProps

const factCell = (fact: PurchaseStatusFact) => (
    <div key={fact.label} className={FACT_CELL_CLASS_NAME}>
        <Text size="xs" tone="muted">
            {fact.label}
        </Text>
        <Text size="sm" overflow="wrap">
            {fact.value}
        </Text>
    </div>
)

const factRow = (fact: PurchaseStatusFact) => (
    <div className={FACT_ROW_CLASS_NAME}>
        <Text size="sm" tone="muted">
            {fact.label}
        </Text>
        <Text size="sm" weight="semibold" overflow="wrap">
            {fact.value}
        </Text>
    </div>
)

const checkRow = (check: PurchaseStatusRail["checks"][number]) => (
    <div key={check.id} className={ROW_CLASS_NAME}>
        <IconTile source={check.mark} tone={check.tone} size="sm" />
        <div className={ROW_BODY_CLASS_NAME}>
            <div className={ROW_HEAD_CLASS_NAME}>
                <Text size="sm" weight="semibold">
                    {check.label}
                </Text>
                <Badge tone={check.tone}>{check.word}</Badge>
            </div>
            {check.at === undefined ? null : (
                <Text size="xs" tone="muted">
                    {check.at}
                </Text>
            )}
            {check.detail === undefined ? null : (
                <Text size="xs" tone="muted" overflow="wrap">
                    {check.detail}
                </Text>
            )}
        </div>
    </div>
)

const timelineRow = (row: PurchaseStatusTimelineRow) => (
    <div key={row.id} className={ROW_CLASS_NAME}>
        <IconTile source={row.mark} tone="success" size="sm" />
        <div className={ROW_BODY_CLASS_NAME}>
            <Text size="sm" weight="semibold">
                {row.title}
                {row.at === undefined ? "" : ` — ${row.at}`}
            </Text>
            {row.detail === undefined ? null : (
                <Text size="xs" tone="muted" overflow="wrap">
                    {row.detail}
                </Text>
            )}
        </div>
    </div>
)

const operationBand = (operation: PurchaseStatusOperation) => (
    <div className={BAND_CLASS_NAME}>
        <Text size="xs" tone="muted">
            {operation.heading}
        </Text>
        <div className={ROW_HEAD_CLASS_NAME}>
            <Text size="md" weight="semibold">
                {operation.name}
            </Text>
            <Badge tone={operation.tone}>{operation.word}</Badge>
        </div>
        <Progress label={operation.progressLabel} value={operation.progressValue} />
        {operation.started === undefined ? null : (
            <Text size="xs" tone="muted">
                {operation.started}
            </Text>
        )}
        {operation.lastObservation === undefined ? null : (
            <Text size="xs" tone="muted" overflow="wrap">
                {operation.lastObservation}
            </Text>
        )}
    </div>
)

/** Pair each banner part with a key built once from its text and its occurrence, since parts can repeat. */
const keyedBannerParts = (parts: ReadonlyArray<string>) => {
    const seen = new Map<string, number>()
    return parts.map((text) => {
        const occurrence = seen.get(text) ?? 0
        seen.set(text, occurrence + 1)
        return { key: `${text}:${occurrence}`, text }
    })
}

const primaryCard = (
    primary: PurchaseStatusPrimary,
    view: Exclude<PurchaseStatusFlowViewProps, { state: "loading" } | { state: "denied" }>,
) => (
    <SurfaceCard label={primary.label} fact={primary.fact} composition="joined" height="fill">
        {primary.banner === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <div className={BANNER_CLASS_NAME}>
                    {keyedBannerParts(primary.banner).map((part, index) =>
                        index === 0 ? (
                            <Text key={part.key} weight="semibold">
                                {part.text}
                            </Text>
                        ) : (
                            <Text key={part.key} size="sm" tone="muted">
                                · {part.text}
                            </Text>
                        ),
                    )}
                </div>
            </div>
        )}
        <div className={BAND_CLASS_NAME}>
            <div className={FACT_GRID_CLASS_NAME}>{primary.facts.map(factCell)}</div>
        </div>
        {primary.cadenceFacts === undefined || primary.cadenceFacts.length === 0 ? null : (
            <div className={BAND_CLASS_NAME}>
                <div className={FACT_GRID_CLASS_NAME}>{primary.cadenceFacts.map(factCell)}</div>
            </div>
        )}
        {primary.operation === undefined ? null : operationBand(primary.operation)}
        {primary.timeline?.map((row) => (
            <div key={row.id} className={BAND_CLASS_NAME}>
                {timelineRow(row)}
            </div>
        ))}
        {primary.footnote === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <Text size="xs" tone="muted" overflow="wrap">
                    {primary.footnote}
                </Text>
            </div>
        )}
        {primary.action === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <PurchaseStatusActions kind="primary" action={primary.action} on={view.on} />
            </div>
        )}
    </SurfaceCard>
)

const railCard = (
    rail: PurchaseStatusRail,
    view: Exclude<PurchaseStatusFlowViewProps, { state: "loading" } | { state: "denied" }>,
) => (
    <SurfaceCard label={rail.label} fact={rail.fact} composition="joined" height="fill">
        {rail.latestCheck === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <Text size="sm" weight="semibold">
                    {rail.latestCheck}
                </Text>
            </div>
        )}
        {rail.checks.length === 0 ? null : <div className={BAND_CLASS_NAME}>{rail.checks.map(checkRow)}</div>}
        {rail.facts?.map((fact) => (
            <div key={fact.label} className={BAND_CLASS_NAME}>
                {factRow(fact)}
            </div>
        ))}
        {rail.notice === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <div className={NOTICE_CLASS_NAME}>
                    <Badge tone="warning">!</Badge>
                    <Text size="sm" overflow="wrap">
                        {rail.notice}
                    </Text>
                </div>
            </div>
        )}
        {rail.outcome === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <Text size="sm" weight="semibold" overflow="wrap">
                    {rail.outcome.title}
                </Text>
                {rail.outcome.detail === undefined ? null : (
                    <Text size="xs" tone="muted" overflow="wrap">
                        {rail.outcome.detail}
                    </Text>
                )}
            </div>
        )}
        {rail.action === undefined && rail.secondaryLink === undefined && rail.refusalText === undefined ? null : (
            <div className={BAND_CLASS_NAME}>
                <PurchaseStatusActions kind="rail" rail={rail} on={view.on} />
            </div>
        )}
    </SurfaceCard>
)

/** Draw the purchase facts, source checks, and their loading or denied states. */
export const PurchaseStatusChecks = (props: PurchaseStatusChecksProps) => {
    if (props.state === "loading")
        return <PurchaseStatusLoadingPreview copy={props.props.copy} surface={props.props.surface} />
    if (props.state === "denied")
        return (
            <SurfaceCard label={props.props.copy.purchases} composition="single">
                <EmptyNotice
                    message={props.props.message}
                    description={props.props.description}
                    actionLabel={props.props.copy.returnToList}
                    onAction={props.on.returnToList}
                />
            </SurfaceCard>
        )
    return (
        <PrimaryRailLayout
            railWidth="standard"
            collapsedOrder="primary-first"
            align="start"
            primary={primaryCard(props.props.primary, props)}
            rail={railCard(props.props.rail, props)}
        />
    )
}
