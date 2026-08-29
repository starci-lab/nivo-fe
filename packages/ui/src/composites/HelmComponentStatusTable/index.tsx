import { Badge, type BadgeTone } from "../../leaves/Badge"
import { Text } from "../../leaves/Text"

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
export type HelmComponentStatusTableProps = { readonly props: HelmComponentStatusTableData; readonly isLoading?: boolean }

/** Render safe component status rows, including stable loading placeholders. */
export const HelmComponentStatusTable = (props: HelmComponentStatusTableProps) => {
    const rows = props.isLoading ? [undefined, undefined, undefined] : props.props.rows
    return (
        <div>
            {rows.map((row, index) => (
                <div key={row?.id ?? `loading-${index}`}>
                    <div>
                        <Text props={{ content: row?.name, weight: "semibold" }} isLoading={props.isLoading} />
                        <Text props={{ content: row?.detail, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
                    </div>
                    <Badge props={{ content: row?.kind, tone: "neutral" }} isLoading={props.isLoading} />
                    <Badge props={{ content: row?.status, tone: row?.statusTone }} isLoading={props.isLoading} />
                    <Text props={{ content: row?.resources, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
                </div>
            ))}
        </div>
    )
}