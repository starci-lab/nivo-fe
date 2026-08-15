import { Badge, type BadgeTone } from "../../leaves/Badge"
import { Text } from "../../leaves/Text"
import { Tree } from "../../branches/Tree"
import type { CompositeProps } from "../../contracts/props"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "../../contracts/props"

/** One public-safe Helm component row. */
export type HelmComponentStatusRow = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly kind: string
    readonly status: string
    readonly statusTone: BadgeTone
    readonly resources: string
}

/** Stable table identity and its component rows. */
export type HelmComponentStatusTableData = { readonly id: string; readonly rows: ReadonlyArray<HelmComponentStatusRow> }
/** Closed data surface for the Helm component table. */
export type HelmComponentStatusTableProps = CompositeProps<HelmComponentStatusTableData>

/** Draw the public-safe component projection of a Helm release. */
export const HelmComponentStatusTable = ({ props, isLoading = false }: HelmComponentStatusTableProps) => (
    <Tree
        contract="helm-component-status-table"
        render={defineContractComponent("helm-component-status-table", {
            component: (isLoading ? [0, 1, 2] : props.rows).map((row, index) => {
                const value = typeof row === "number" ? undefined : row
                return defineCompositeComponent("helm-component-status-row", {}, () => (
                    <Tree
                        key={value?.id ?? index}
                        contract="helm-component-status-row"
                        render={defineContractComponent("helm-component-status-row", {
                            identity: defineContractComponent("subject-over-muted-caption", {
                                subject: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: value?.name, weight: "semibold" }} isLoading={isLoading} />),
                                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: value?.detail, size: "xs", tone: "muted" }} isLoading={isLoading} />),
                            }),
                            kind: defineLeafComponent("badge", { tone: "neutral" }, () => <Badge props={{ content: value?.kind, tone: "neutral" }} isLoading={isLoading} />),
                            state: defineLeafComponent("badge", {}, () => <Badge props={{ content: value?.status, tone: value?.statusTone }} isLoading={isLoading} />),
                            resources: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: value?.resources, size: "xs", tone: "muted" }} isLoading={isLoading} />),
                        })}
                    />
                ))
            }),
        })}
    />
)

/** Source-level tier marker for the Helm component table. */
export const meta = { shape: "composite", world: "pure" } as const
