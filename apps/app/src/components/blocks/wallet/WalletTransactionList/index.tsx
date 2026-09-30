import { DrawerBranch } from "@nivo/ui"
import { Badge, Button, Heading, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common"
import type {
    LedgerSectionView,
    LinkedInvoiceSectionView,
    WalletControlCenterActions,
    WalletLedgerRow,
} from "@/modules/wallet/wallet-center/types"
import { WalletFact } from "../WalletFact"

const noteSection = (label: string, note: string) => (
    <SurfaceCard label={label}>
        <div>
            <Text size="sm" tone="muted">
                {note}
            </Text>
        </div>
    </SurfaceCard>
)

const ledgerDetail = (row: WalletLedgerRow) => (
    <div>
        <div>
            {row.detailFacts.map((fact) => (
                <WalletFact key={fact.id} row={fact} />
            ))}
        </div>
        {row.note === undefined ? undefined : (
            <Text size="sm" tone="muted">
                {row.note}
            </Text>
        )}
    </div>
)

const ledgerRow = (row: WalletLedgerRow | undefined, isLoading: boolean, closeLabel: string) => {
    const LedgerDetailContent = () => (row === undefined ? null : ledgerDetail(row))
    return (
        <div>
            <div>
                <Text size="sm" isSkeleton={isLoading}>
                    {row?.title ?? ""}
                </Text>
                <Text size="xs" tone="muted" isSkeleton={isLoading}>
                    {row?.caption ?? ""}
                </Text>
            </div>
            <Badge tone={row?.tone ?? "neutral"} isSkeleton={isLoading}>
                {row?.state ?? ""}
            </Badge>
            <Text size="sm" weight="semibold" isSkeleton={isLoading}>
                {row?.amount ?? ""}
            </Text>
            {row === undefined ? undefined : (
                <DrawerBranch
                    triggerLabel={row.detailLabel}
                    title={row.title}
                    closeLabel={closeLabel}
                    content={LedgerDetailContent}
                    contentProps={{}}
                />
            )}
        </div>
    )
}

/** Three skeleton rows stand in for a ledger that has not answered yet. */
const RESTING_LEDGER_ROWS: ReadonlyArray<null> = [null, null, null]

const walletLedgerContent = (ledger: LedgerSectionView, closeLabel: string) => {
    if (ledger.phase === "resting")
        return (
            <div>
                {RESTING_LEDGER_ROWS.map((_, index) => (
                    <div key={index}>{ledgerRow(undefined, true, closeLabel)}</div>
                ))}
            </div>
        )
    const rows: ReadonlyArray<WalletLedgerRow> = ledger.phase === "answered" ? ledger.rows : []
    return (
        <div>
            {rows.map((row) => (
                <div key={row.id}>{ledgerRow(row, false, closeLabel)}</div>
            ))}
        </div>
    )
}

const ledgerSection = (ledger: LedgerSectionView, closeLabel: string, action?: () => void) => {
    if (ledger.phase === "empty" || ledger.phase === "refused") return noteSection(ledger.label, ledger.note)
    const content = walletLedgerContent(ledger, closeLabel)
    const actionLabel = ledger.phase === "answered" ? ledger.actionLabel : undefined
    const isLoading = ledger.phase === "resting"
    return (
        <SurfaceListCard
            label={ledger.label}
            footer={
                actionLabel !== undefined && (ledger.phase === "resting" || action !== undefined) ? (
                    <Button variant="primary" size="sm" isSkeleton={isLoading} onPress={action}>
                        {actionLabel}
                    </Button>
                ) : undefined
            }
            isLoading={isLoading}
        >
            {content}
        </SurfaceListCard>
    )
}

const linkedInvoiceSection = (
    linkedInvoice: LinkedInvoiceSectionView,
    closeLabel: string,
    on?: WalletControlCenterActions,
) => {
    if (linkedInvoice.phase === "refused") return noteSection(linkedInvoice.label, linkedInvoice.note)
    const loading = linkedInvoice.phase === "resting"
    const row = linkedInvoice.phase === "answered" ? linkedInvoice.row : undefined
    const content = (
        <div>
            <div>
                <Text size="sm" weight="semibold" isSkeleton={loading}>
                    {row?.title ?? linkedInvoice.orderLabel}
                </Text>
                <Text size="xs" tone="muted" isSkeleton={loading}>
                    {row?.caption ?? ""}
                </Text>
            </div>
            <Badge tone={row?.tone ?? "neutral"} isSkeleton={loading}>
                {row?.state ?? ""}
            </Badge>
            <Heading level={2}>{row?.amount ?? ""}</Heading>
            <Text size="xs" tone="muted" isSkeleton={loading}>
                {linkedInvoice.orderLabel}
            </Text>
            <Text size="sm" tone="muted" isSkeleton={loading}>
                {linkedInvoice.phase === "answered" ? linkedInvoice.consequence : ""}
            </Text>
            {linkedInvoice.phase === "answered" ? (
                <Button
                    variant="primary"
                    isDisabled={linkedInvoice.actionDisabled}
                    onPress={linkedInvoice.actionKind === "return" ? on?.returnToOrder : on?.payInvoice}
                >
                    {linkedInvoice.actionLabel}
                </Button>
            ) : undefined}
        </div>
    )
    return (
        <div>
            <div>
                <Heading level={3}>{linkedInvoice.label}</Heading>
            </div>
            <SurfaceCard isHighlight state={loading ? "pending" : "neutral"}>
                {content}
            </SurfaceCard>
        </div>
    )
}

type WalletTransactionListProps = {
    readonly transactions: LedgerSectionView
    readonly invoices: LedgerSectionView
    readonly linkedInvoice?: LinkedInvoiceSectionView
    readonly closeLabel: string
    readonly on?: WalletControlCenterActions
}

/** Draw the transaction and invoice ledgers, including one correlated order invoice when present. */
export const WalletTransactionList = (props: WalletTransactionListProps) => (
    <>
        {props.linkedInvoice === undefined
            ? undefined
            : linkedInvoiceSection(props.linkedInvoice, props.closeLabel, props.on)}
        {ledgerSection(props.transactions, props.closeLabel)}
        {ledgerSection(props.invoices, props.closeLabel, props.on?.payInvoice)}
    </>
)
