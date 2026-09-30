import { Text, Badge, type BadgeTone } from "@starci/grammar/common"

/** One public-safe component row returned by a Helm status view. */
export type HelmComponentStatusRow = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly kind: string
    readonly status: string
    readonly statusTone: BadgeTone
    readonly resources: string
}

/** Resolved release identity and component rows. */
export type HelmComponentStatusTableData = { readonly id: string; readonly rows: ReadonlyArray<HelmComponentStatusRow> }

/** Props for the Helm component status table. */
export type HelmComponentStatusTableProps = {
    readonly props: HelmComponentStatusTableData
    readonly isLoading?: boolean
}

/** One drawn row: its key beside the data, absent while loading. */
type HelmComponentStatusEntry = { readonly key: string; readonly row: HelmComponentStatusRow | undefined }

/** The fixed skeleton rows: one key per placeholder, since a placeholder has no id of its own. */
const LOADING_KEYS: ReadonlyArray<string> = ["loading-first", "loading-second", "loading-third"]

/** Render safe component status rows, including stable loading placeholders. */
export const HelmComponentStatusTable = (props: HelmComponentStatusTableProps) => {
    const rows: ReadonlyArray<HelmComponentStatusEntry> = props.isLoading
        ? LOADING_KEYS.map((key) => ({ key, row: undefined }))
        : props.props.rows.map((row) => ({ key: row.id, row }))
    return (
        <div>
            {rows.map(({ key, row }) => (
                <div key={key}>
                    <div>
                        <Text weight="semibold" isSkeleton={props.isLoading}>
                            {row?.name}
                        </Text>
                        <Text size="xs" tone="muted" isSkeleton={props.isLoading}>
                            {row?.detail}
                        </Text>
                    </div>
                    <Badge tone="neutral" isSkeleton={props.isLoading}>
                        {row?.kind}
                    </Badge>
                    <Badge tone={row?.statusTone} isSkeleton={props.isLoading}>
                        {row?.status}
                    </Badge>
                    <Text size="xs" tone="muted" isSkeleton={props.isLoading}>
                        {row?.resources}
                    </Text>
                </div>
            ))}
        </div>
    )
}
