import { Badge, IconTile, Progress, Text } from "@starci/grammar/common"
import type {
    PurchaseStatusFact,
    PurchaseStatusOperation,
    PurchaseStatusRail,
    PurchaseStatusTimelineRow,
} from "@/modules/agentos/purchase-status/view-model"
import {
    BAND_CLASS_NAME,
    FACT_CELL_CLASS_NAME,
    FACT_ROW_CLASS_NAME,
    ROW_BODY_CLASS_NAME,
    ROW_CLASS_NAME,
    ROW_HEAD_CLASS_NAME,
} from "./classNames"

/** Draw one resolved purchase-status evidence item. */
export const factCell = (fact: PurchaseStatusFact) => (
    <div key={fact.label} className={FACT_CELL_CLASS_NAME}>
        <Text size="xs" tone="muted">
            {fact.label}
        </Text>
        <Text size="sm" overflow="wrap">
            {fact.value}
        </Text>
    </div>
)

/** Draw one resolved purchase-status evidence item. */
export const factRow = (fact: PurchaseStatusFact) => (
    <div className={FACT_ROW_CLASS_NAME}>
        <Text size="sm" tone="muted">
            {fact.label}
        </Text>
        <Text size="sm" weight="semibold" overflow="wrap">
            {fact.value}
        </Text>
    </div>
)

/** Draw one resolved purchase-status evidence item. */
export const checkRow = (check: PurchaseStatusRail["checks"][number]) => (
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

/** Draw one resolved purchase-status evidence item. */
export const timelineRow = (row: PurchaseStatusTimelineRow) => (
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

/** Draw one resolved purchase-status evidence item. */
export const operationBand = (operation: PurchaseStatusOperation) => (
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
