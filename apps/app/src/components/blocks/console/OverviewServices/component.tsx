import { Badge, Button, SurfaceListCard, Text, TextAction, type BadgeTone } from "@starci/grammar/common"
import {
    OVERVIEW_SERVICES_COPY_CLASS_NAME,
    OVERVIEW_SERVICES_END_CLASS_NAME,
    OVERVIEW_SERVICES_ROW_CLASS_NAME,
    OVERVIEW_SERVICES_ROWS_CLASS_NAME,
} from "./classNames"

/** One owned service, closing on its own onward action. */
export type OverviewServicesRow = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly actionLabel: string
    readonly isDisabled?: boolean
    readonly route?: string
    /** Unresolved carrier: the same row shape at rest, each leaf shown loading. */
    readonly isSkeleton?: boolean
}
/** Resolved service rows and the card's own label and fact. */
export type OverviewServicesViewProps = {
    readonly props: {
        readonly label: string
        readonly fact?: string
        readonly isLoading?: boolean
        readonly rows: ReadonlyArray<OverviewServicesRow>
    }
    readonly on?: {
        readonly open?: (route: string) => void
    }
}
type OverviewServicesProps = OverviewServicesViewProps
const row = (item: OverviewServicesRow, open?: (route: string) => void) => {
    const route = item.route
    const onPress = route === undefined ? undefined : () => open?.(route)
    return (
        <div
            key={item.id}
            className={OVERVIEW_SERVICES_ROW_CLASS_NAME}
            data-contract="GAP-3 PADDING-4 PADDING-3"
            data-row="true"
        >
            <div className={OVERVIEW_SERVICES_COPY_CLASS_NAME} data-contract="GAP-1 FLOW-3" data-copy="true">
                <TextAction size="sm" onPress={onPress} isSkeleton={item.isSkeleton}>
                    {item.name}
                </TextAction>
                <Text size="xs" tone="muted" isSkeleton={item.isSkeleton}>
                    {item.detail}
                </Text>
            </div>
            <div className={OVERVIEW_SERVICES_END_CLASS_NAME} data-contract="GAP-3" data-end="true">
                <Badge tone={item.statusTone} isSkeleton={item.isSkeleton}>
                    {item.statusLabel}
                </Badge>
                <Button size="sm" onPress={onPress} isDisabled={item.isDisabled} isSkeleton={item.isSkeleton}>
                    {item.actionLabel}
                </Button>
            </div>
        </div>
    )
}

/** Draw the things this account runs, one row each, every row closing on its own onward action. */
export const OverviewServicesBase = (props: OverviewServicesProps) => {
    const { props: view, on } = props
    const { label, fact, rows, isLoading } = view
    return (
        <SurfaceListCard label={label} fact={fact} isLoading={isLoading}>
            <div
                className={OVERVIEW_SERVICES_ROWS_CLASS_NAME}
                data-contract="BOUNDARY-3"
                data-overview-services-rows="true"
            >
                {rows.map((item) => row(item, on?.open))}
            </div>
        </SurfaceListCard>
    )
}

/** Registry identity for the pure overview services twin. */
