"use client"

import { Header, ListBox } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/** One destination owned by the single-selection navigation list. */
export type SelectionListItem = {
    readonly id: string
    readonly label: string
    readonly status?: string
    readonly isDisabled?: boolean
}

/** One labelled run inside the destination list. */
export type SelectionListGroup = {
    readonly id: string
    readonly label?: string
    readonly items: ReadonlyArray<SelectionListItem>
}

/** Closed destination data consumed by {@link SelectionList}. */
export type SelectionListData = {
    readonly label: string
    readonly selectedKey: string
    readonly groups: ReadonlyArray<SelectionListGroup>
}

/** Route activation reported to connected navigation code. */
export type SelectionListActions = {
    readonly activate?: (id: string) => void
}

/** Props for the HeroUI-owned single-selection destination list. */
export type SelectionListProps = LeafProps<SelectionListData, SelectionListActions>

/** Draw grouped destinations with one controlled selected key and native keyboard traversal. */
export const SelectionList = ({ props, on }: SelectionListProps) => (
    <ListBox
        data-tier="leaf"
        data-component="SelectionList"
        aria-label={props.label}
        selectionMode="single"
        selectedKeys={[props.selectedKey]}
        onSelectionChange={(keys) => {
            if (keys === "all") return
            const selected = keys.values().next().value
            if (selected !== undefined) on?.activate?.(String(selected))
        }}
        className="gap-1 p-0"
    >
        {props.groups.map((group) => (
            <ListBox.Section key={group.id} id={group.id} className="flex flex-col gap-1">
                {group.label === undefined ? null : (
                    <Header className="px-2 pb-1 pt-3 text-xs font-medium text-muted">
                        {group.label}
                    </Header>
                )}
                {group.items.map((item) => (
                    <ListBox.Item
                        key={item.id}
                        id={item.id}
                        textValue={item.label}
                        isDisabled={item.isDisabled}
                        className="flex cursor-pointer items-center gap-2 rounded-large px-3 py-2 text-foreground outline-none data-[disabled=true]:cursor-default data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent data-[hovered=true]:bg-default data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent"
                    >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                        {item.status === undefined ? null : (
                            <span className="shrink-0 text-xs text-muted">{item.status}</span>
                        )}
                    </ListBox.Item>
                ))}
            </ListBox.Section>
        ))}
    </ListBox>
)

/** Source-level tier marker for the closed destination list. */
export const meta = { shape: "leaf", world: "pure" } as const
