import {
    Avatar,
    Badge,
    Button,
    SurfaceCard,
    SurfaceListCard,
    Text,
    TextLink,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@nivo/ui"
import type { BadgeTone } from "@nivo/ui"
import type { LeafProps } from "@nivo/ui"
import type { SurfaceListCardActions } from "@nivo/ui/branches/SurfaceListCard"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"

/** One owned application, with display copy and lifecycle meaning already resolved. */
export type AppsSummaryItem = {
    readonly id: string
    readonly name: string
    readonly detail: string
    readonly statusLabel: string
    readonly statusTone: BadgeTone
    readonly actionLabel: string
}

/** Settled situation drawn by the applications summary. */
export type AppsSummaryState =
    | { readonly phase: "pending" }
    | { readonly phase: "empty", readonly message: string }
    | { readonly phase: "populated", readonly items: ReadonlyArray<AppsSummaryItem> }
    | { readonly phase: "forbidden", readonly message: string }

/** Business data, resolved copy, and actions consumed by the applications summary. */
export type AppsSummaryProps = {
    readonly label: string
    readonly state: AppsSummaryState
    readonly onOpenApp: (id: string) => void
}

const rows = (
    items: ReadonlyArray<AppsSummaryItem>,
    onOpenApp: AppsSummaryProps["onOpenApp"],
) => items.map((item) => defineContractComponent("avatar-identity-badge-action-row", {
    avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ name: item.name, size: "md" }} />),
    identity: defineContractComponent("name-over-handle", {
        name: defineLeafComponent("text-link", { size: "sm" }, () => (
            <TextLink props={{ label: item.name, size: "sm" }} on={{ press: () => onOpenApp(item.id) }} />
        )),
        handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: item.detail, size: "xs", tone: "muted" }} />
        )),
    }),
    badge: defineLeafComponent("badge", {}, () => (
        <Badge props={{ content: item.statusLabel, tone: item.statusTone }} />
    )),
    action: defineLeafComponent("button", {}, () => (
        <Button props={{ label: item.actionLabel, size: "sm" }} on={{ press: () => onOpenApp(item.id) }} />
    )),
}))

const pendingRows = () => Array.from({ length: 3 }, () => defineContractComponent("avatar-identity-badge-action-row", {
    avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ size: "md" }} isLoading />),
    identity: defineContractComponent("name-over-handle", {
        name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: "", size: "sm" }} isLoading />),
        handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "" }} isLoading />),
    }),
    action: defineLeafComponent("button", {}, () => <Button props={{ label: "" }} isLoading />),
}))

/** Draw owned applications without fetching, translating, or deriving collection totals. */
export const AppsSummary = ({ label, state, onOpenApp }: AppsSummaryProps) => {
    if (state.phase === "empty") {
        return (
            <SurfaceCard
                props={{ label }}
                contract="centred-empty-notice"
                render={defineContractComponent("centred-empty-notice", {
                    notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: state.message }} />),
                })}
            />
        )
    }
    if (state.phase === "forbidden") {
        return (
            <SurfaceCard
                props={{ label }}
                contract="body-with-refusal-note"
                render={defineContractComponent("body-with-refusal-note", {
                    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: state.message, size: "sm", tone: "muted" }} />
                    )),
                })}
            />
        )
    }
    const isLoading = state.phase === "pending"
    const content = defineContractComponent("identity-action-list", (input: LeafProps<{ readonly label: string }, SurfaceListCardActions>) => {
        void input
        return <Tree
            contract="identity-action-list"
            render={defineContractComponent("identity-action-list", {
                item: isLoading ? pendingRows() : rows(state.items, onOpenApp),
            })}
        />
    })
    return (
        <SurfaceListCard
            props={{ label }}
            contract="identity-action-list"
            render={content}
            isLoading={isLoading}
        />
    )
}

/** Source-level tier marker for the pure applications summary block. */
export const meta = { shape: "block", world: "pure" } as const
