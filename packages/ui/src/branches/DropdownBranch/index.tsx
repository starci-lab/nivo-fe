import { Dropdown, Header } from "@heroui/react"
import { Tree } from "../Tree"
import { Icon, type IconName } from "../../leaves/Icon"
import type { ContractKey, ContractPropValue } from "../../contracts"
import type { BoundContractComponent, LeafComponent } from "../../contracts/props"

/** Placement choices exposed without leaking vendor vocabulary beyond this branch. */
export type DropdownBranchPlacement = "bottom left" | "bottom right" | "top left" | "top right"

/** One product-owned menu action. */
export type DropdownBranchItemData<I extends string> = {
    readonly id: I
    readonly label: string
    readonly icon?: IconName
    readonly isDisabled?: boolean
    readonly tone?: "default" | "danger"
    readonly showsIndicator?: boolean
}

/** One semantic group in the dropdown. */
export type DropdownBranchSectionData<I extends string> = {
    readonly items: ReadonlyArray<DropdownBranchItemData<I>>
}

/** Closed data projected into complete HeroUI dropdown anatomy. */
export type DropdownBranchData<I extends string> = {
    readonly label: string
    readonly placement?: DropdownBranchPlacement
    readonly sections: ReadonlyArray<DropdownBranchSectionData<I>>
    readonly selectionMode?: "single"
    readonly selectedId?: I
}

/** Menu selection reported without putting behavior in item data. */
export type DropdownBranchActions<I extends string> = {
    readonly action?: (id: I) => void
}

/** Typed content accepted by the vendor trigger and optional header. */
type DropdownContent = LeafComponent<string, Readonly<Record<string, ContractPropValue>>>
    | BoundContractComponent<ContractKey>

/** Props for content-agnostic dropdown mechanics. */
export type DropdownBranchProps<I extends string> = {
    readonly props: DropdownBranchData<I>
    readonly on?: DropdownBranchActions<I>
    readonly trigger: LeafComponent<string, Readonly<Record<string, ContractPropValue>>>
    readonly header?: DropdownContent
}

const renderTypedContent = (content: DropdownContent) => {
    if (!("kind" in content)) return content()
    return <Tree contract={content.meta.contract} render={content} />
}

/** Own HeroUI popover, focus, keyboard, section and item mechanics in one branch. */
export const DropdownBranch = <const I extends string>(input: DropdownBranchProps<I>) => (
    <Dropdown>
        <Dropdown.Trigger
            aria-label={input.props.label}
            className="button button--md button--tertiary button--icon-only rounded-full"
        >
            {input.trigger()}
        </Dropdown.Trigger>
        <Dropdown.Popover placement={input.props.placement ?? "bottom right"}>
            {input.header === undefined ? null : (
                <Header className="border-b border-separator">
                    {renderTypedContent(input.header)}
                </Header>
            )}
            <Dropdown.Menu
                aria-label={input.props.label}
                selectionMode={input.props.selectionMode}
                selectedKeys={input.props.selectedId === undefined ? undefined : new Set([input.props.selectedId])}
            >
                {input.props.sections.map((section) => (
                    <Dropdown.Section key={section.items.map((item) => item.id).join(":")}>
                        {section.items.map((item) => (
                            <Dropdown.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                                isDisabled={item.isDisabled}
                                className={item.tone === "danger" ? "text-danger-soft-foreground" : undefined}
                                onAction={() => input.on?.action?.(item.id)}
                            >
                                {item.showsIndicator === true ? <Dropdown.ItemIndicator /> : null}
                                {item.icon === undefined ? null : <Icon props={{ name: item.icon, role: "leading" }} />}
                                {item.label}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Section>
                ))}
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown>
)

/** Source-level tier marker for dropdown mechanics. */
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const
