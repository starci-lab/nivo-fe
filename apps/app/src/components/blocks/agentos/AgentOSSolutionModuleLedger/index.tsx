import { EmptyNotice, SurfaceCard, SurfaceListCard, Text, TextAction, Badge, Button } from "@starci/grammar/common"
import type {
    AgentOSSolutionLedgerRow,
    AgentOSSolutionModuleCard,
    AgentOSSolutionModuleLedgerProps as LedgerProps,
} from "../../../../modules/agentos/solution-module-center"
import { AgentOSSolutionModuleCatalogGrid } from "../AgentOSSolutionModuleCatalogGrid"
import {
    SOLUTION_LEDGER_COPY_CLASS_NAME,
    SOLUTION_LEDGER_ROW_CLASS_NAME,
    SOLUTION_LEDGER_ROWS_CLASS_NAME,
    SOLUTION_LEDGER_TRAILING_CLASS_NAME,
} from "./classNames"

/** Props for {@link AgentOSSolutionModuleLedgerView}. */
export type AgentOSSolutionModuleLedgerProps = {
    readonly ledger: LedgerProps
    readonly cards: ReadonlyArray<AgentOSSolutionModuleCard>
    readonly pendingId?: string
    readonly outcome?: string
    readonly onPressCard: (id: string) => void
}

const restingRows: ReadonlyArray<AgentOSSolutionLedgerRow> = ["installed-loading-1", "installed-loading-2"].map(
    (id) => ({ id, name: "", detail: "", kind: "", status: "", statusTone: "neutral", action: "", href: "#" }),
)

const ledgerRow = (row: AgentOSSolutionLedgerRow, loading: boolean) => (
    <div key={row.id} className={SOLUTION_LEDGER_ROW_CLASS_NAME} data-contract="GAP-3 PADDING-4 PADDING-3">
        <div className={SOLUTION_LEDGER_COPY_CLASS_NAME} data-contract="GAP-1">
            <TextAction size="sm" isSkeleton={loading} href={row.href}>
                {row.name}
            </TextAction>
            <Text size="xs" tone="muted" isSkeleton={loading}>
                {row.detail}
            </Text>
        </div>
        <div className={SOLUTION_LEDGER_TRAILING_CLASS_NAME} data-contract="GAP-2">
            <Badge tone="neutral" isSkeleton={loading}>
                {row.kind}
            </Badge>
            <Badge tone={row.statusTone} isSkeleton={loading}>
                {row.status}
            </Badge>
            <Button variant="secondary" size="sm" isSkeleton={loading} href={row.href}>
                {row.action}
            </Button>
        </div>
    </div>
)

/** List installed solutions above the catalogue, keeping each section's state in place. */
export const AgentOSSolutionModuleLedger = (props: AgentOSSolutionModuleLedgerProps) => {
    const { ledger, cards, pendingId, outcome, onPressCard }: AgentOSSolutionModuleLedgerProps = props
    const browseCatalogue = () => {
        const node = document.querySelector<HTMLElement>("[data-region='module-catalogue']")
        if (node === null) return
        node.scrollIntoView({ behavior: "smooth", block: "start" })
        node.focus()
    }
    const loading = ledger.installedState === "resting"
    const installed =
        ledger.installedState === "failed" ? (
            <SurfaceCard label={ledger.installedLabel}>{ledger.installedNotice}</SurfaceCard>
        ) : ledger.installedState === "empty" ? (
            <SurfaceCard label={ledger.installedLabel}>
                <EmptyNotice
                    message={ledger.installedEmptyTitle}
                    description={ledger.installedEmpty}
                    actionLabel={ledger.installedEmptyAction}
                    actionVariant="secondary"
                    onAction={browseCatalogue}
                />
            </SurfaceCard>
        ) : (
            <SurfaceListCard label={ledger.installedLabel} isLoading={loading}>
                <div className={SOLUTION_LEDGER_ROWS_CLASS_NAME} data-contract="BOUNDARY-3">
                    {(loading ? restingRows : ledger.installedRows).map((row) => ledgerRow(row, loading))}
                </div>
            </SurfaceListCard>
        )
    const catalogue =
        ledger.catalogueState === "failed" ? (
            <SurfaceCard label={ledger.catalogLabel}>{ledger.catalogueNotice}</SurfaceCard>
        ) : ledger.catalogueState === "empty" ? (
            <SurfaceCard label={ledger.catalogLabel}>
                <EmptyNotice message={ledger.catalogueEmptyTitle} description={ledger.catalogueEmpty} />
            </SurfaceCard>
        ) : (
            <SurfaceCard label={ledger.catalogLabel}>
                <AgentOSSolutionModuleCatalogGrid
                    cards={cards}
                    loading={ledger.catalogueState === "resting"}
                    pendingId={pendingId}
                    onPressCard={onPressCard}
                />
            </SurfaceCard>
        )
    return (
        <>
            {installed}
            <div id="module-catalogue" tabIndex={-1} data-region="module-catalogue">
                {catalogue}
            </div>
            {outcome === undefined ? null : (
                <Text size="sm" tone="muted" live="polite">
                    {outcome}
                </Text>
            )}
        </>
    )
}
