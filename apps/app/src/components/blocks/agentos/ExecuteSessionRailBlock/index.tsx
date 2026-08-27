"use client"

import {
    Button, ChoiceTabs, CollapsibleRail, Icon, SelectionList, Tree,
    defineContractComponent, defineLeafComponent,
    type SelectionListGroup,
} from "@nivo/ui"

/** One collaborative Execute conversation listed outside the private Setup session. */
export type ExecuteSession = {
    readonly id: string
    readonly title: string
    readonly updatedLabel: string
    readonly status: "active" | "archived"
}

/** Session navigation commands owned by the responsive rail adapter. */
export type ExecuteSessionRailBlockProps = {
    readonly sessions: ReadonlyArray<ExecuteSession>
    readonly selectedId: string | null
    readonly pending?: boolean
    readonly onSelect: (sessionId: string) => void
    readonly onCreate: () => void
}

type SessionSelectionProps = {
    readonly sessions: ReadonlyArray<ExecuteSession>
    readonly selectedId: string | null
    readonly onSelect: (sessionId: string) => void
    readonly presentation: "expanded" | "compact"
}

const groupsFor = (sessions: ReadonlyArray<ExecuteSession>): ReadonlyArray<SelectionListGroup> => [{
    id: "execute-sessions",
    items: sessions.map((session) => ({
        id: session.id,
        label: session.title,
        icon: "agentos" as const,
        status: session.status === "archived" ? "Archived" : session.updatedLabel,
    })),
}]

const SessionSelection = ({ sessions, selectedId, presentation, onSelect }: SessionSelectionProps) => (
    <SelectionList
        props={{
            label: "Execute sessions",
            selectedKey: selectedId ?? "",
            presentation,
            groups: groupsFor(sessions),
        }}
        on={{ activate: onSelect }}
    />
)

const SessionRailBody = (props: ExecuteSessionRailBlockProps) => (
    <Tree contract="agentos-session-rail-compact" render={defineContractComponent("agentos-session-rail-compact", {
        sessions: defineLeafComponent("selection-list", {}, () => <SessionSelection {...props} presentation="expanded" />),
        create: defineLeafComponent("button", {}, () => (
            <Button props={{ label: "New session", variant: "primary", isPending: props.pending }} on={{ press: props.onCreate }} />
        )),
    })} />
)

const SessionRailToggle = () => <Icon props={{ name: "sidebar", role: "leading" }} />

/** Navigate multiple Execute conversations through one selected identity at every breakpoint. */
export const ExecuteSessionRailBlock = ({ sessions, selectedId, pending, onSelect, onCreate }: ExecuteSessionRailBlockProps) => {
    const railProps = { sessions, selectedId, pending, onSelect, onCreate }
    return (
    <Tree contract="agentos-session-rail-responsive" render={defineContractComponent("agentos-session-rail-responsive", {
        compact: defineContractComponent("agentos-session-rail-compact", {
            sessions: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: "Execute sessions",
                        selectedKey: selectedId ?? "",
                        tabs: sessions.map((session) => ({ id: session.id, label: session.title })),
                    }}
                    on={{ select: onSelect }}
                />
            )),
            create: defineLeafComponent("button", {}, () => (
                <Button props={{ label: "New session", variant: "secondary", isPending: pending }} on={{ press: onCreate }} />
            )),
        }),
        expanded: defineLeafComponent("collapsible-rail", {}, () => (
            <CollapsibleRail
                ariaLabel="Execute sessions"
                title="Sessions"
                rail={SessionRailBody}
                railProps={railProps}
                collapsedRail={SessionSelection}
                collapsedRailProps={{ ...railProps, presentation: "compact" }}
                toggleControl={SessionRailToggle}
                toggleControlProps={{}}
                collapseLabel="Collapse session rail"
                expandLabel="Expand session rail"
                storageKey="nivo:agentos:execute-sessions"
            />
        )),
    })} />
    )
}

/** Source-level tier marker for the pure Execute-session rail adapter. */
export const meta = { shape: "block", world: "pure" } as const
