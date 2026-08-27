import { Badge, Button, SurfaceCard, SurfaceListCard, Text, TextLink, Tree, defineCompositeComponent, defineContractComponent, defineLeafComponent, type LeafProps, type SurfaceListCardActions, type SurfaceListCardData } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"

/** One custom-module identity prepared for the joined management list. */
export type CustomModuleCollectionRow = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly kind: string
    readonly status: string
    readonly action: string
}

/** Settled collection state and exact navigation actions for the pure block. */
export type AgentOSCustomModuleCollectionViewProps = {
    readonly state: "loading" | "refused" | "empty" | "ready"
    readonly title: string
    readonly refused: string
    readonly empty: string
    readonly createLabel: string
    readonly rows: ReadonlyArray<CustomModuleCollectionRow>
    readonly onOpen: (id: string) => void
    readonly onCreate: () => void
}

const rowView = (row: CustomModuleCollectionRow, loading: boolean, onOpen: (id: string) => void) =>
    defineContractComponent("identity-kind-status-action-row", {
        identity: defineContractComponent("name-over-handle", {
            name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: row.name, size: "sm" }} on={{ press: () => onOpen(row.id) }} />),
            handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: row.detail, size: "xs" }} isLoading={loading} />),
        }),
        kind: defineLeafComponent("badge", { tone: "neutral" }, () => <Badge props={{ content: row.kind, tone: "neutral" }} isLoading={loading} />),
        status: defineLeafComponent("badge", {}, () => <Badge props={{ content: row.status, tone: row.status === "Active" ? "success" : "warning" }} isLoading={loading} />),
        action: defineLeafComponent("button", {}, () => <Button props={{ label: row.action, size: "sm", variant: "secondary" }} on={{ press: () => onOpen(row.id) }} isLoading={loading} />),
    })

const customModuleContent = (
    shown: ReadonlyArray<CustomModuleCollectionRow>,
    loading: boolean,
    onOpen: (id: string) => void,
) => defineContractComponent("custom-module-collection", (input: LeafProps<SurfaceListCardData, SurfaceListCardActions>) => (
    <Tree key={input.props.label} contract="custom-module-collection" render={defineContractComponent("custom-module-collection", {
        module: shown.map((row) => rowView(row, loading, onOpen)),
    })} />
))

/** Draw custom drafts and active modules with local refusal and empty states. */
export const AgentOSCustomModuleCollectionBase = ({ state, title, refused, empty, createLabel, rows, onOpen, onCreate }: AgentOSCustomModuleCollectionViewProps) => {
    if (state === "refused") return <SurfaceCard props={{ label: title, actionLabel: createLabel }} on={{ act: onCreate }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", { note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: refused, size: "sm", tone: "muted" }} />) })} />
    if (state === "empty") return <SurfaceCard props={{ label: title }} contract="centred-empty-notice" render={defineContractComponent("centred-empty-notice", { notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: empty, actionLabel: createLabel }} on={{ act: onCreate }} />) })} />
    const shown = state === "loading" ? [0, 1, 2].map((index) => ({ id: `loading-${index}`, name: title, detail: "", kind: "Custom", status: "Draft", action: createLabel })) : rows
    const content = customModuleContent(shown, state === "loading", onOpen)
    return <SurfaceListCard props={{ label: title, actionLabel: createLabel }} on={{ act: onCreate }} contract="custom-module-collection" render={content} isLoading={state === "loading"} />
}

/** Source-level tier marker for the pure custom-module collection. */
export const meta = { shape: "block", world: "pure" } as const
